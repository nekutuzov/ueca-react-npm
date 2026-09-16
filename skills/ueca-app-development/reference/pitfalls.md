# Pitfalls — symptom, cause, fix

Start here when something already misbehaves. Most UECA failures are **silent**: no error, no warning,
just a view that never updates or a handler that never runs. Work down this list before changing the
design.

## First move: turn tracing on

```ts
UECA.globalSettings.traceLog = true;
```

…or, in a running page with no rebuild:

```js
window.UECA.traceLog = true;
window.UECA.tracing = { capture: 5000 };
window.UECA.trace.save();          // reopen in the trace viewer
```

Every model creation, lifecycle hook, render, property change, binding sync, cache decision and bus
message is recorded. **A render failure is invisible with tracing off** — the component just renders as
`null` — so this is the first step, not the last.

## Nothing re-renders

| Symptom | Cause | Fix |
| --- | --- | --- |
| `model.items[0].done = true` changes nothing | arrays are **shallow** — the item object is not observable | wrap items at insertion: `model.items.push(UECA.observe(item))`, or `model.items = raw.map(UECA.observe)` |
| assigning a prop changes nothing | the value is **structurally equal** to the old one — assignment short-circuits | assign a genuinely different value, or call `model.invalidateView()` |
| a `__`-prefixed prop changes nothing | `__` props are the **non-reactive** slot by design | rename it without the `__` prefix if it must be observable |
| a view ignores a prop it should track | the `View` never **reads** that property — only views that read it re-render | read it in the view, or force it with `model.invalidateView()` |
| a value that is not a declared prop changes nothing | only declared props are observable. A module-level `let` is not state | declare it as a prop on some model |

## A prop has the wrong value

| Symptom | Cause | Fix |
| --- | --- | --- |
| a prop set at runtime reverts on the next parent render | it is passed through **JSX**, where a prop is a *standing declaration* re-asserted every render | pass a `bind(...)` instead — bindings are never reassigned |
| a constant passed in a `children` section never updates | `children`-section params are applied **at startup only**; a constant there is an *initial value* | pass a getter `() => model.x` or a `bind(...)` |
| a prop is `undefined` when you expected a value | **every model prop is `T \| undefined`** — unseeded, or bound and not yet run | read defensively: `model.items?.length ?? 0`. Application code assumes `strictNullChecks: false` |
| a model captured from JSX is `undefined` right after render | the **first render returns `null`**; the model initialises in an effect | capture it with an inline `init` param and await it — `<X id="x" init={(m) => { model = m }} />` |

## State is lost or shared unexpectedly

| Symptom | Cause | Fix |
| --- | --- | --- |
| a form resets when you navigate away and back | the model is not cached | give the JSX child an explicit `id`; check `cacheable` is not `false` and `modelCacheMode` is not `"no-cache"` |
| **"Two children of … are rendered with the same id"** | siblings share an `id`, which is identity, cache key, bus address and DOM id at once | derive each list child's id from its item, never a constant |
| the wrong child model comes back, or children swap identities | the cache for hook-created children is **positional**, and a hook was called conditionally or in a loop | never call a component hook inside a condition or loop — render JSX for a data-driven set |
| a child is rebuilt on every remount | a JSX child with **no `id`** is never cached | give it an explicit `id` |
| per-activation setup runs only once | it is in `constr`, which does **not** run on a cache retrieval | move it to `init`, which runs on every retrieval |
| a subscription leaks after the component goes away | released in the wrong hook | release in `deinit` (deactivation) or `unmount` (DOM) |

## A message never arrives

| Symptom | Cause | Fix |
| --- | --- | --- |
| a handler never fires | the handling component is **not mounted** — subscription lasts exactly as long as the mount | own the service as a child of a component that lives for the app's lifetime |
| a handler never fires, and nothing throws | `unicast` with **zero** subscribers returns `undefined` by design | check the id spelling and that the handler's component is mounted |
| **"more than one subscriber"** throws | `unicast`/`castTo` expect **exactly one**; the throw happens *before* any dispatch | use `broadcast` if a fan-out was intended, or narrow the subscription |
| `castTo` reaches nobody | the first argument must be an exact `fullId()`, not an `id` | log `model.fullId()` on the target, or use `broadcast` with a `RegExp` |
| the call does not type-check | the message type was not passed to the struct | add it: `UECA.ComponentStruct<{ … }, AppMessage>` — and to `ComponentParams`/`ComponentModel` |
| `unicast("Msg", undefined)` is a compile error | a message with no `in` takes **no payload argument** | write `unicast("Msg")` |

## Events behave oddly

| Symptom | Cause | Fix |
| --- | --- | --- |
| `onChange<Prop>` fires fewer times than `onChanging<Prop>` | correct: `onChanging` runs on every attempt, `onChange` only when the value actually changed | nothing to fix |
| an `async onChanging*` throws | `onChanging*` handlers **must be synchronous** | do the async work in `onChange*` or a method |
| **"Re-entrant assignment to property …"** | a handler assigned **its own** property a *different* value; the nested write would be discarded | rewrite the value by **returning it** from `onChanging<Prop>`. Assigning a *different* property is fine |
| a throwing `onChange*` is invisible at the assignment | it is caught inside the dispatcher and never propagates | it reaches `globalSettings.errorHandler` — look there, not in a `try/catch` |
| an event assignment throws | only a **function or `undefined`** may be assigned to an event | check what you are assigning |
| a struct handler still runs after a caller supplied one | params handlers are **chained**, not substituted — struct first | that is the design; do not expect replacement |
| `model.onClick()` throws | events are unset until a caller supplies one | always optional-call: `model.onClick?.()` |

## Bindings

| Symptom | Cause | Fix |
| --- | --- | --- |
| **"Invalid arguments for bind()"** | the first argument must **always be a function** | `bind(() => model.user, "name")`, never `bind(model.user, "name")` |
| **"changed from a binding to a value"** | a param switched kind between renders — a conditional `bind(...)` in JSX | keep one binding and put the condition **inside the getter** |
| **"did not settle after N binding rounds"** | an `onChanging*` handler keeps rejecting a value its binding keeps re-delivering | reject the value at the **source** too, or raise `globalSettings.bindingRetries` |
| assigning a `Bond` to a property throws | bindings arrive through params or the struct, never by assignment | pass it as a param |
| a bound `cacheable` throws | `cacheable` is resolved before the model exists, so it can never be bound | pass a plain boolean |
| an in-place array mutation does not cross a binding | the **source is a plain object**, not observable | wrap it: `UECA.observe({ items: [] })` |
| a *read-only* binding still lets a `push` reach the source | a read-only bond governs the **reference**, not the contents | return `.slice()` from the getter |
| a struct binding beats the params one | by design — the struct binding is the authority | move the logic to whichever end should win |

## Rendering and errors

| Symptom | Cause | Fix |
| --- | --- | --- |
| a component renders nothing, silently, for ever | its `View` threw, the boundary spent its retries, and **the placeholder is only visible with `traceLog` on** | set `traceLog` in the development build; the error still reaches `globalSettings.errorHandler` |
| a component stays blank after the cause is fixed | the boundary **does not recover on its own** | use the placeholder's `retry` control, or remount |
| a component renders nothing and no hook ran | `constr` threw — nothing downstream can run | check `globalSettings.errorHandler`; write hooks that cannot throw |
| a `mount` hook cannot find its own DOM element | a **crashed component still mounts**: `mount()` runs, `draw()` never did | do element work in `draw`, and guard for a missing element |
| an `async draw` or `erase` throws | both must be **synchronous** — a layout effect is not awaited | move async work to `mount`/`unmount` |
| `IF({ condition, children })` still crashes on a null read | JSX evaluates the **children before** the condition is tested | use a ternary to guard a property access |
| a `View` returning `undefined` breaks | `UECA.ReactElement` is `JSX.Element \| null` | return `null` to draw nothing |

## Structure

| Symptom | Cause | Fix |
| --- | --- | --- |
| a duplicate-member error at construction | `props`, `children`, `methods` and `events` share **one namespace** | rename one; the error names every duplicate |
| assigning to a method or a child model throws | both are read-only on the model | assign to a prop instead |
| **"Cannot access X before initialization"** from a hook or a handler | `X` is a `const`/`let` written **after** `return model` — the initializer never runs, so the binding stays in the temporal dead zone for the model's whole life | only `function` declarations hoist past the return. Make it a function, a module-level constant, or a `__`-prefixed prop |
| `model` is `undefined` inside a handler | the struct is declared **before** `const model = …` — but handlers only run later | keep the order; if it really is undefined, you called something during struct construction |
| two models behave as one | a struct literal was **reused** — `useComponent` writes back into it | build the struct fresh inside the hook |
| importing `ueca-react` fails outside a browser | the library touches `window` at import time | it needs a DOM; there is no SSR support without a shim |

## Reaching for React

If you are about to write one of these in application code, stop — you have missed a UECA feature:

| React reflex | What to use instead |
| --- | --- |
| `useState` | declare a prop; assign it with `=` |
| `useEffect(…, [])` | the `constr` hook |
| `useEffect` with deps | nothing — views re-render from what they read. If you need a side effect on a change, use `onChange<Prop>` |
| effect cleanup | `deinit` (deactivation) or `unmount` (DOM) |
| `useRef` for mutable non-state | a `__`-prefixed prop |
| `useMemo` / `useCallback` | nothing — the model persists; methods are stable |
| `useContext` / a store | the message bus, or a binding |
| lifting state up | a `bind()` between the two models |
| `document.getElementById` | `id={model.htmlId()}`, and read it from `draw` |
| a class component | a UECA component |

## Still stuck

Capture a trace and read it — it records the model's whole life:

```js
window.UECA.tracing = { capture: 5000 };
// …reproduce…
window.UECA.trace.save("trace.json");     // then open it in <UECA.TraceViewer/>
```

A `bind` record names the bond it crossed and its direction (`in` / `out`), and every bus dispatch records
which of `broadcast` / `castTo` / `unicast` was used — enough to tell "the source never changed" from "the
change never arrived".
