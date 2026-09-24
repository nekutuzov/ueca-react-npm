# Public API

Everything importable from `ueca-react`, and everything present on a model. **Nothing else exists.** If a
name is not on this page, do not use it — check here before writing any `UECA.*` call.

```ts
import * as UECA from "ueca-react";
```

## Component model

| Export | Signature | Notes |
| --- | --- | --- |
| `useComponent` | `(struct, params?) => model` | the core hook. Creates the model, or returns the cached one |
| `useExtendedComponent` | `(baseStruct, extStruct, params?, baseHook?) => model` | merges a base struct with an extension. `baseHook` defaults to `useComponent`; pass a hook to extend an already-extended component |
| `getFC` | `(useX) => FunctionComponent` | turns a model hook into a JSX-usable component |
| `isComponentModel` | `(obj: unknown) => boolean` | plain boolean, **not** a type predicate — it does not narrow |
| `$` / `$name` | `Symbol` / `"$"` | the key of the private-members bag. The proxy resolves both |

## Bindings

| Export | Signature |
| --- | --- |
| `bind` | `bind(getter, setter)` · `bind(() => obj, "prop")` · `bind(getter, undefined)` → a `Bond` |
| `bindProp` | **deprecated** — use `bind(() => obj, "prop")` |

The first argument is **always a function**. Passing the object itself throws
`Invalid arguments for bind()`.

## Message bus

| Export | Signature |
| --- | --- |
| `useMessaging` | `(model) => bus` — subscribes a model to its `messages` handlers. Called for you by `useComponent`; you rarely need it directly |
| `defaultMessageBus` | `<TMsg>() => MessageBus<TMsg>` — the process-wide singleton, for code that has no model |

Bus methods, reached as `model.bus.…` or on `defaultMessageBus<TMsg>()`:

| Method | Semantics | Returns |
| --- | --- | --- |
| `broadcast(filter, message, payload?)` | every subscriber whose `fullId()` matches. `null` / `undefined` / `""` means **all**; a string matches exactly; a `RegExp` is tested against it | `Promise` of an array of all results |
| `castTo(fullId, message, payload?)` | the single subscriber at that exact `fullId` | `Promise` of that result |
| `unicast(message, payload?)` | whoever handles it, without naming them — **exactly one** subscriber expected | `Promise` of that result |

`getAsync` and `postAsync` are **deprecated** — use `unicast`.

> `unicast` and `castTo` **throw before dispatching** if more than one subscriber matches, so no handler
> runs and nothing lands. Zero subscribers is not an error: `unicast` returns `undefined`.

## Settings and tracing

| Export | Shape |
| --- | --- |
| `globalSettings` | the mutable settings object. `window.UECA` is the **same object**, so it can be changed from a devtools console |
| `trace` | the captured trace: `records()`, `clear()`, `toJSON()`, `toMermaid()`, `save(name?)`, `subscribe(fn)` |
| `TraceViewer` | `<UECA.TraceViewer height={600}/>` — the viewer as a panel inside your app |
| `TraceViewerButton` | `<UECA.TraceViewerButton/>` — a corner button that opens the viewer **in a window of its own** (the default), leaving the app usable underneath and surviving a route change. `target="overlay"` opens it as a panel over the app instead; a refused window falls back to that panel automatically |

`globalSettings` fields:

| Setting | Type | Default | Effect |
| --- | --- | --- | --- |
| `traceLog` | `boolean` | `false` | console output, **and** the visible render-error placeholder |
| `tracing` | `{ capture?: number; sink?: (r) => void }` | `undefined` | record the last N events in memory and/or forward each. Independent of `traceLog` |
| `hashHtmlId` | `boolean` | `false` | hash `htmlId()` to 6 characters. `fullId()` is never hashed, so bus addressing and cache keys are unaffected |
| `modelCacheMode` | `"no-cache" \| "cache" \| "auto-cache"` | `"auto-cache"` | model caching policy |
| `renderRetries` | `number` | `1` | re-render attempts before a failed `View` gives up |
| `bindingRetries` | `number` | `10` | rounds of forced re-convergence for a bound property |
| `errorHandler` | `(error: Error) => void` | `undefined` | receives unhandled errors and render errors |

There are **no environment variables** — `globalSettings` is the entire configuration surface.

## Utilities

**Type guards** — all TypeScript type predicates. Route runtime type checks through these rather than raw
`typeof`:

`isUndefined` · `isNull` · `isBoolean` · `isString` · `isNumber` · `isFunction` · `isArray` · `isObject` ·
`isMap` · `isSymbol`

**Comparison and collections:**

| Export | Behaviour |
| --- | --- |
| `isEqual(a, b)` | structural comparison, recursing per object key. `isEqual(NaN, NaN)` is `false`; arrays are walked as plain objects |
| `intersection(a, b)` | array intersection |

**Rendering:**

| Export | Behaviour |
| --- | --- |
| `IF({ condition, children })` | conditional rendering without a ternary. **JSX evaluates the children before the condition is tested**, so it cannot guard a property access inside them — use a ternary for that |
| `renderNode(node)` | renders a `ReactNode` **or** a component type |
| `RenderNode` | the component form of `renderNode`, with an optional `render` flag |
| `observe(value)` | makes a plain object observable, or wraps a component in `observer` — so you never import MobX |

**Assertions and misc:**

| Export | Behaviour |
| --- | --- |
| `errorIf(condition, msg?)` | throws when the condition is true. Default message `"Invalid condition"` |
| `errorIfNot(condition, msg?)` | throws when false. An **assertion signature**, so it narrows afterwards |
| `sleep(ms)` | `await`-able delay |
| `clone(obj)` | deep clone via JSON. Loses `undefined`, functions and symbols; `NaN`/`Infinity` become `null`, `Date` becomes a string, `Map`/`Set` become `{}` |

## Types

`ComponentStruct` · `ComponentParams` · `ComponentModel` · `GeneralComponentStruct` · `AnyComponentStruct` ·
`AnyComponentParams` · `AnyComponentModel` · `ComponentView` · `Bond` · `DynamicChildren` · `ErrorHandler` ·
`MaybePromise` · `EmptyObject` · `ReactElement` · `ReactCSS` · `TraceRecord` · `TraceKind` · `TraceLevel` ·
`BusDispatch` · `BondKind` · `BindDirection` · `TraceOptions` · `TraceApi` · `BusMessages` ·
`BusMessageHandlers` · `MessageBus` · `TraceViewerProps` · `TraceViewerButtonProps` · `TraceTheme` ·
`TraceViewerPlacement`

The three you write by hand are `ComponentStruct`, `ComponentParams` and `ComponentModel`. The `Any*`
variants exist for code that must accept *any* component — e.g. the return of `getChildrenModels()`.

> `UECA.ReactElement` is `React.JSX.Element | null` — deliberately **not** `undefined`. Declare `View`,
> `*View` methods and `*View` slot props with it. A View returning `null` draws nothing and is complete,
> not a workaround.

## Members on every model

Not exports — they exist on every model without being declared:

| Member | Kind | Purpose |
| --- | --- | --- |
| `id` | prop | instance identity |
| `cacheable` | prop | caching opt-in/out |
| `bus` | prop | the `MessageBus` this model is subscribed to |
| `fullId()` | method | dotted owner path, e.g. `app.form.submitButton` |
| `htmlId()` | method | the DOM id derived from `fullId()`; `undefined` when the id is empty |
| `birthMark()` | method | random per-instance tag, trace output only |
| `disableOnChange()` / `enableOnChange()` / `changeNotifyDisabled()` | methods | suppress change notification for a silent bulk update. An unmatched `enableOnChange()` throws |
| `clearModelCache()` | method | tear down this model's caches recursively |
| `getChildrenModels()` | method | child models as an array |
| `invalidateView()` | method | force a re-render |
| `View` / `BaseView` / `BaseViews` | getter | the rendered output, and the base chain when extended. The same component type on every read, so plain React components beneath keep their state |
| `$` | object | private members bag |

### `model.$` — the parts application code may use

| Field | Meaning |
| --- | --- |
| `$.__status.baseResult` | the base implementation's result inside a chained method or event — the documented way for an extending component to read it |
| `$.__status.initPhase` | `undefined` → new, `"constructed"` → inactive, `"initialized"` → active |
| `$.__status.mountPhase` | `init-mount` / `mounting` / `mounted` / `unmounting` |

Everything else in `$` is framework bookkeeping. In particular `$.__owner` reaches the parent model — it
works, and using it is **discouraged**: a child that names its parent cannot be read, tested or moved on
its own. Report upward through an event instead.

## Not available

- **A custom message bus cannot be installed.** There is no exported provider; every model uses the
  singleton.
- There is **no store, no reducer, no query cache and no context API** for application state. State lives
  on models, crosses to one other component through a binding, and crosses the app through the bus.
