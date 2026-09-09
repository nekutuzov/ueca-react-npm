# Error Handling in UECA-React
#errors #error_handler #boundary #resilience

## Description

UECA-React is built on the premise that application code should not be littered with `try`/`catch`. The
framework catches what it can, keeps one failure from taking down the page, and routes everything it caught
to a single place you control: `globalSettings.errorHandler`.

That promise has a shape, and knowing the shape is what makes it usable:

- **A failing `View` is contained to its own component.** Its parent, its siblings and its children keep
  rendering.
- **A failing event or binding handler does not break the assignment that triggered it.** The value still
  lands; the exception is reported instead of propagating.
- **A failing lifecycle hook is reported and never retried.** The component's state machine keeps moving so
  the model can still be torn down.
- **A mistake in how a component is *declared* throws immediately.** Duplicate member names, a binding where
  a plain value is required, an asynchronous handler where a synchronous one is required — these are faults
  in your code, not runtime conditions, and they fail loudly at the point of the mistake.

The dividing line is worth stating plainly: **the framework absorbs failures in your handlers, and refuses
structural mistakes in your declarations.**

---

## API/Methods

### `globalSettings.errorHandler`

- **Signature**: `(error: Error) => void`
- **Default**: `undefined` — nothing is reported anywhere except the console, and only when `traceLog` is on.

Set it once, in your entry file, before the first component renders:

```typescript
import * as UECA from "ueca-react";

UECA.globalSettings.errorHandler = (error) => {
    myTelemetry.captureException(error);
};
```

Everything the framework catches arrives here:

| Source | What it means |
| --- | --- |
| a rejected promise or an uncaught error anywhere on the page | the two `window` listeners the library installs at load. This is also how a throwing `async` lifecycle hook surfaces, because the hook runners deliberately do not catch |
| a render failure inside a component's `View` | forwarded by that component's error boundary once it has given up retrying |
| an exception thrown by `onChange<Prop>`, `onChanging<Prop>`, `onPropChange` or `onPropChanging` | swallowed so the assignment completes, then reported |
| an exception thrown by a binding's getter or setter | swallowed so the property keeps its value, then reported |
| a property that will not settle | after `bindingRetries` rounds of re-convergence — see [Automatic onChanging Events](Automatic%20onChanging%20Events%20in%20UECA-React.md) |
| a parameter that changed from a binding to a value, or back | reported *and* thrown, because the render that did it must not stand |

> **Leaving `errorHandler` unset is not the same as having no errors.** Without it, a swallowed handler
> exception is reported only through `componentModelDebug`, which is gated by `traceLog` — so in a production
> build it says nothing at all. Set it, even if it only calls `console.error`.

### `globalSettings.renderRetries`

- **Type**: `number`
- **Default**: `1`

How many times a component's error boundary re-renders a failed `View` before it gives up. The retry is
asynchronous, so a `View` that failed on a value which has since arrived recovers by itself. Raise it if your
views depend on data that lands late; set it to `0` to fail on the first attempt.

### `globalSettings.bindingRetries`

- **Type**: `number`
- **Default**: `10`

How many rounds of forced re-convergence a bound property gets when a changing handler rejected or rewrote
its value, before the framework accepts that it will not settle and reports a divergence. Bindings normally
converge in one or two rounds; this only bounds the case where they never would.

---

## The per-component error boundary

Every component renders its `View` inside its own error boundary. A `View` that throws therefore takes down
**that component's subtree only** — the parent's other children keep drawing, and a component at the root of
the tree is protected just as well as one at the bottom.

```typescript
View: () =>
    <div id={model.htmlId()}>
        {model.user.name.toUpperCase()}   {/* throws while `user` is still undefined */}
    </div>
```

What happens, in order:

1. The boundary catches the exception.
2. It schedules a retry, up to `globalSettings.renderRetries` times. If the data arrived in the meantime,
   the view draws and nothing further happens.
3. Once the retries are spent, it reports the error through `globalSettings.errorHandler`.
4. It renders a placeholder in the slot the view would have occupied — **but only when
   `globalSettings.traceLog` is on**. With tracing off, a permanently failed view renders nothing.

The placeholder is a development aid, not an end-user surface: hazard stripes and the component's `htmlId()`
path, sized to the slot rather than floating over the page. Clicking it opens a report with the error
message, the model's `birthMark()`, and buttons to copy the report, log the model to the console, retry the
render, or close.

> **A component whose `View` failed is still mounted.** `mount()` has run; `draw()` has not, because the
> layout effect that calls it lives in the part that threw. Do not assume a failed view means a torn-down
> model.

---

## What throws, and why

These are refused rather than absorbed. Each one is a mistake that cannot produce a working component, so
failing quietly would only move the symptom somewhere less obvious.

| Refused | Message |
| --- | --- |
| the same name in two struct sections | `The component structure … contains not unique members: <name>` |
| two sibling components rendered with the same `id` | `Two children of "<parent>" are rendered with the same id "<id>"` |
| a `Bond` assigned as a property value | `Attempt to assign binding as a value` |
| a binding supplied for `cacheable` | `Bindings are not permitted for the property "cacheable" …` |
| an `onChanging` handler that returns a `Promise` | `Asynchronous OnChanging<Prop> event is not allowed` |
| an `async` `draw` or `erase` hook | `Asynchronous draw hook is not allowed` |
| assigning to a declared method or child model | `Attempt to replace method …` |
| a non-function assigned to an event | rejected with the member and model named |
| a parameter that switched between a binding and a value | `Parameter "<name>" … changed from a binding to a value` |
| more than one subscriber for `unicast` or `castTo` | `… expects exactly one subscriber, but N are subscribed` |
| re-entrant assignment that would **replace** a value already being written | `Re-entrant assignment to property "<name>" …` |

The last one has a nuance worth knowing: writing the value that is **already** on its way in is *not*
refused. It discards nothing, and it is exactly what a converging binding does. Only a write that would throw
away the value in flight is a fault. See
[Automatic onChange Events](Automatic%20onChange%20Events%20in%20UECA-React.md).

---

## Code Examples

### Reporting everything, in one place

```typescript
// index.tsx — before the first render
import * as UECA from "ueca-react";

UECA.globalSettings.errorHandler = (error) => {
    console.error("[UECA]", error);
    myTelemetry.captureException(error);
};

// Keep a silent recording for post-mortems, with the console clean:
UECA.globalSettings.tracing = { capture: 5000 };
```

When something goes wrong in the field, `UECA.trace.save()` downloads the recorded events leading up to it.
See [Tracing](Tracing%20in%20UECA-React.md).

### Writing a `View` that cannot fail

Guarding is cheaper than recovering, and application code is written with `strictNullChecks: false`, so the
compiler will not remind you:

```typescript
View: () =>
    <div id={model.htmlId()}>
        {model.user?.name?.toUpperCase() ?? "—"}
    </div>
```

### Letting a slow load resolve itself

```typescript
props: {
    id: useProfile.name,
    data: undefined
},

init: async (model) => {
    model.data = await model.bus.unicast("Api.GetProfile");
},

View: () =>
    <div id={model.htmlId()}>
        <UECA.IF condition={!!model.data}>
            <span>{model.data.fullName}</span>
        </UECA.IF>
    </div>
```

`init` is asynchronous and the view renders before it finishes, so the condition — not the boundary — is what
carries the component through the gap.

---

## Best Practices

- **Always set `errorHandler`.** It is the only thing standing between a swallowed exception and silence.
- **Guard, do not rely on the boundary.** The boundary is a safety net for the unforeseen; a value that is
  routinely undefined during load should be handled with `?.` or `UECA.IF`.
- **Do not use the boundary as control flow.** It retries a fixed number of times and then stops; it is not a
  loading state.
- **Report from `onChanging`, do not throw from it.** An exception there is swallowed and the assignment
  proceeds; returning `oldValue` is how you actually block a change.
- **Turn `traceLog` on while developing** so the placeholder and its report are visible, and off in
  production so the console stays clean. Keep `tracing.capture` on in both.
- **Read the error message before changing the code.** Every refusal above names the component, the member
  and, where it helps, the fix.

---

## Notes

- The two `window` listeners call `event.preventDefault()` only when `errorHandler` is set. With it unset,
  default browser behaviour is left completely intact.
- Reporting a failure must not itself fail: every read the placeholder makes about a broken model, and the
  call into `errorHandler`, runs under a guard. A model too damaged to describe itself degrades the report
  rather than cascading into the parent.
- The framework's own cache bookkeeping is **repaired rather than thrown** when it goes inconsistent — a bug
  inside the library must not crash a consuming application. The one exception is two irreconcilable static
  caches for a single model, where continuing would silently discard models.
- Errors in extended components reach the same handler; chaining does not swallow anything of its own.
