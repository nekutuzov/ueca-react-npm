# Composing an application

## How components reach each other

A component is a **black box with two faces**:

- **Private face** — properties, methods, events, children, view. Reachable **only by its owner**, and
  only downward.
- **Public face** — messages. Reachable by anyone.

That split is the whole coupling policy. It is what lets a component be read, tested and moved on its own.

| Situation | Channel |
| --- | --- |
| a parent drives its child | direct — `model.childName.doThing()` |
| a child reports upward | an event the parent supplied |
| one property must stay in sync across two components | a binding — `UECA.bind(...)` |
| a component needs data from a service | `bus.unicast(...)` or `bus.castTo(...)` |
| something app-wide must be announced | `bus.broadcast(...)` |
| non-UECA code must reach in | the `messagebus.post` window event |

**Reaching upward is not a channel.** `model.$.__owner` exists and works; using it produces code that
cannot be read in isolation. A child talks upward through the events its parent supplied.

## Static children vs JSX children

Two ways to bring a child into a component, with **different parameter semantics**. This is the single
most common source of "my prop doesn't update".

```ts
children: { nameInput: useInput({ label: "Name" }) }   // static — hook call
```
```tsx
View: () => <Input id="nameInput" label="Name" />      // dynamic — JSX
```

| | `children` section | JSX |
| --- | --- | --- |
| params applied | **at startup only** | **on every render** |
| a constant means | an *initial value* | a *standing declaration* |
| a runtime change to that prop | persists | is overwritten on the next parent render |
| bindings | applied once, then live | never reassigned — an edited bound field survives |
| the set of children | must be fixed | may be data-driven |
| conditional creation | **forbidden** — the cache is positional | fine |

So: **if a statically declared child must follow something, pass a binding or a getter, not a constant.**

### Data-driven lists

Put the list in a `*View` **method** — it is its own observer, so it re-renders when the collection changes
without the owner's `View` running:

```tsx
methods: {
    _RowsView: () => (
        <div id={model.htmlId() + "-rows"}>
            {model.items.map((item) => (
                <ItemRow
                    key={item.id}
                    id={`row-${item.id}`}
                    caption={item.name}
                />
            ))}
        </div>
    ),
},

View: () => (
    <div id={model.htmlId()}>
        <model._RowsView />
    </div>
)
```

Every dynamic child needs a **unique, item-derived `id`** — never a constant, never omitted:

- Without an `id` the model is **not cached** and is rebuilt on every remount.
- Two siblings under the same `id` **throw**: the id is identity, cache key, bus address and DOM id at
  once, so duplicates would silently share one model.

## Identity

| Accessor | Value |
| --- | --- |
| `id` | a normal prop. Convention: `id: useX.name` |
| `fullId()` | the dotted path built from the owner chain — `app.form.submitButton` |
| `htmlId()` | the DOM id derived from `fullId()`; `undefined` when the id is empty |

A child declared in a `children` section has its `id` **overwritten with the struct key**.

Identity is used for four things at once — the trace log, the DOM id, bus addressing, and the model cache
key — so:

- Always set `id: useX.name` as the first prop.
- Always put `id={model.htmlId()}` on the root JSX element.
- Derive a list child's id from the item.
- **Never reassign `id` after creation** — it moves the path, the cache key and the bus address together.

Because every component renders `id={model.htmlId()}`, UI tests and e2e selectors can address a component
**by its position in the model hierarchy**: `app.ui.screen.emailInput`.

> `globalSettings.hashHtmlId = true` shortens the DOM id to a 6-character token. `fullId()` is never
> hashed, so bus addressing and cache keys are unaffected — but every selector written against the dotted
> path breaks. Check your tests before enabling it.

## Model caching

Models **outlive their React elements**: a model is cached by its parent, so state survives an
unmount/remount cycle and conditional rendering no longer resets a form. On by default.

`globalSettings.modelCacheMode`:

| Mode | Meaning |
| --- | --- |
| `"no-cache"` | nothing is cached, regardless of per-component settings |
| `"cache"` | cached only when `cacheable` is explicitly `true` |
| `"auto-cache"` | **default** — cached unless `cacheable` is explicitly `false` |

Resolution: global `"no-cache"` wins outright → else `params.cacheable` → else `struct.props.cacheable` →
else the global mode. `cacheable` may not be bound in either position.

**Design around these:**

- **`init` runs on every cache retrieval; `constr` does not.** Per-activation resets go in `init`.
- **`deinit` is the deactivation point** for a model being parked — release subscriptions there.
- **The cache for hook-created children is positional.** Never call a component hook conditionally.
- **A dynamic child with no `id` is never cached.**
- Nothing evicts on memory pressure. `model.clearModelCache()` tears a subtree's caches down.

Caching changes only **when models are rebuilt**. `fullId()`, `htmlId()` and bus addresses are unaffected
by it.

## The message bus

A typed, in-process publish/subscribe channel, keyed by message id. Purely local — nothing crosses a
process or a network.

### 1. Declare the contract, in one file

```ts
type AppMessage = {
    "App.UnhandledException": { in: Error };
    "UI.ShowBusy":            { in: boolean };
    "Api.GetUser":            { in: { id: string }; out: User };
    "Api.GetServerTime":      { out: { time: string } };
};
```

Both `in` and `out` are optional. A message with no `in` produces a zero-argument handler **and** a call
that takes no payload argument — `unicast("Msg")`, never `unicast("Msg", undefined)`.

### 2. Pass the message type to the three declarations

```ts
type ServiceStruct = UECA.ComponentStruct<{ … }, AppMessage>;
type ServiceParams = UECA.ComponentParams<ServiceStruct, AppMessage>;
type ServiceModel  = UECA.ComponentModel<ServiceStruct, AppMessage>;
```

Required for **both** handling and posting — it is what makes handler shapes and call sites type-safe.

### 3. Subscribe by declaring handlers

```ts
messages: {
    "Api.GetUser": async ({ id }) => await _request(`/users/${id}`),
}
```

Subscription is automatic on mount and released on unmount. A component with no `messages` section
subscribes to nothing.

### 4. Post

```ts
const user = await model.bus.unicast("Api.GetUser", { id: "42" });
await model.bus.castTo("app.header.clock", "Clock.Refresh");
await model.bus.broadcast(/^app\.ui\.screen\..*Input$/, "UI.ShowBusy", true);
await model.bus.broadcast(null, "UI.ShowBusy", true);         // null = every subscriber
```

| Call | Semantics |
| --- | --- |
| `unicast` | asks *whoever* handles it, without naming them. **Exactly one** subscriber expected |
| `castTo` | names the recipient by exact `fullId()` |
| `broadcast` | every subscriber matching the filter — `null`/`undefined`/`""` for all, a string for exact, a `RegExp` tested against `fullId()` |

`unicast` and `castTo` **throw before dispatching** when more than one subscriber matches, so no handler
runs and nothing lands — that is the contract, not a bug. Zero subscribers is fine: `unicast` returns
`undefined`, because a component that is merely unmounted is a normal state.

Code that has no model reaches the bus through `UECA.defaultMessageBus<AppMessage>()`.

### 5. Non-UECA code reaching in

```js
window.dispatchEvent(new CustomEvent("messagebus.post", {
    detail: { message: "someMessageId", params: { /* … */ } }
}));
```

Forwarded to every subscriber of that id; return values are discarded.

### Practice

- One component handles a given message id, unless it is genuinely a broadcast.
- Name messages by domain: `"Api.GetUser"`, `"UI.Screen.DisableControls"`.
- Keep the contract in one file.
- **Put server API calls behind handlers** — that is the sanctioned place for them.

## Non-visual services

A service is an ordinary component that renders nothing:

```tsx
type ApiServiceStruct = UECA.ComponentStruct<{
    props: { __client: HttpClient; baseUrl: string };
}, AppMessage>;

function useApiService(params?: ApiServiceParams): ApiServiceModel {
    const struct: ApiServiceStruct = {
        props: {
            id: useApiService.name,
            __client: undefined,          // private: not observable
            baseUrl: "/api",
        },

        messages: {
            "Api.GetUser": async ({ id }) => await model.__client.get(`/users/${id}`),
        },

        constr: () => { model.__client = new HttpClient(model.baseUrl); },

        View: () => null,                 // draws nothing, and is complete
    };

    const model = UECA.useComponent(struct, params);
    return model;
}
```

Own it as a child of the root component so it mounts for the app's lifetime. **Nothing imports it** —
callers only know the message id. That is what makes screens independently testable.

## Bootstrap

The library provides no application runner: you render your root component with React as usual.

```tsx
import { createRoot } from "react-dom/client";
import * as UECA from "ueca-react";
import { App } from "./app";
import type { AppMessage } from "./appMessage";

// Set these ONCE, before the first render.
UECA.globalSettings.traceLog = import.meta.env.DEV;          // your app's env, not the library's
UECA.globalSettings.errorHandler = (error: Error) => {
    UECA.defaultMessageBus<AppMessage>().unicast("App.UnhandledException", error);
};

createRoot(document.getElementById("root")!).render(<App id="app" />);
```

- Give the root component an explicit `id` — every `fullId()` in the app descends from it.
- `React.StrictMode` is supported and behaves identically to running without it.
- React 16.8 – 19 are supported; on 16/17 use `ReactDOM.render` instead of `createRoot`, and keep
  `react-dom` on the same major as `react`.
- **The library touches `window` at import time**, so it needs a DOM. It does not run under SSR without a
  shim.

### Suggested build order for a new application

1. **The message contract** — one file. Do it first; it is the app's public wiring.
2. **The entry point** — settings, error handler, root render.
3. **Non-visual services** — API, storage, dialogs, notifications. Reached only over the bus.
4. **The root component** — owns the services plus the visual tree.
5. **Screens and panels** — composed downward, children declared statically where the set is fixed.
6. **Leaf controls** — extend one shared base for cross-cutting behaviour such as validation.

Nothing above is imposed by the library; it is the order in which the pieces stop depending on each other.

## Error handling

Application code writes **no `try/catch`** around UECA operations. Errors are collected centrally.

```ts
UECA.globalSettings.errorHandler = (error: Error) => {
    console.error(error.message);
    UECA.defaultMessageBus<AppMessage>().unicast("App.UnhandledException", error);
};
```

Route it to the bus so a dialog component owns the UI.

What reaches it:

- Throws from the five async lifecycle hooks (`constr`, `init`, `mount`, `unmount`, `deinit`), which
  surface as unhandled rejections rather than at the call site.
- Render failures, after the per-component boundary has spent its retries.
- Throwing `onChange*` handlers, which are otherwise swallowed.
- Binding cascades that fail to converge.

**Each `View` has its own error boundary**, so a failing component is contained: its parent, siblings and
ancestors keep rendering. It retries `globalSettings.renderRetries` times (default 1), then gives up.

Three things to know about that boundary:

- **It does not recover on its own.** A component that failed stays blank for the rest of its life, even
  after the cause is gone. The placeholder's `retry` control buys one more attempt.
- **The visible placeholder appears only when `traceLog` is on.** With tracing off, a permanently failing
  component simply renders as `null` — set `traceLog` in your development build so failures are visible
  rather than blank.
- **A crashed component is still mounted**: `mount()` runs while `draw()` never did, so a `mount` hook
  that looks its own element up by `htmlId()` will find nothing.

Field-level validation is a userland pattern, not a framework feature — build it as a base component and
extend it (see `component.md`).

## Tracing

Every model creation, lifecycle hook, render, property change, binding sync, cache decision and bus
message is a structured trace record.

```tsx
<UECA.TraceViewerButton/>          {/* corner button; opens the viewer in its own window */}
<UECA.TraceViewer height={600}/>   {/* or the panel embedded where you want it */}
```

A closed viewer costs nothing — it is a separate chunk, downloaded only when opened.

Without any UI:

```ts
UECA.globalSettings.tracing = { capture: 5000 };   // record silently
UECA.trace.records();                              // everything captured
UECA.trace.save("trace.json");                     // reopen it in the viewer
UECA.trace.save("flow.mmd");                       // …or write a Mermaid sequence diagram
```

`window.UECA` **is** `globalSettings`, so tracing can be switched on in a running page from a devtools
console with nothing imported and no rebuild:

```js
window.UECA.traceLog = true;
window.UECA.tracing = { capture: 5000 };
window.UECA.trace.save();
```

Leave `traceLog` off in production — it logs on every property change and every render, and it is checked
at each call rather than compiled out.
