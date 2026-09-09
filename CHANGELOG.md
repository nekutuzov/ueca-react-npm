# Changelog

## v3.0.1

The first release of the 3.x line, and the successor to v2.0.6.

### Trace Viewer

- **A visual trace viewer ships with the library.** `<UECA.TraceViewer/>` embeds it in a panel;
  `<UECA.TraceViewerButton/>` drops a button anywhere in an application and opens it as an overlay or in a
  browser tab of its own. Both are development tools, and a closed viewer costs an application nothing —
  the page is a separate chunk that is downloaded only when it is opened.
- **Five views over one trace**: Table, Timeline, Sequence, Tree and Graph — the last drawing the component
  tree with the message bus and binding wiring on top of it, and playing the trace through it. A live trace
  can be followed as the application runs, or played back from the beginning. **Save as** takes two things
  out of the page: the trace as JSON the viewer reads back, and the graph as a standalone SVG.
- **`UECA.trace`** is the API behind it: `records()`, `clear()`, `subscribe()`, `toJSON()`, `toMermaid()`
  and `save()`, which picks its format from the file name it is given — `.mmd` or `.mermaid` for a Mermaid
  sequence diagram, JSON for anything else. Also reachable as `window.UECA.trace` from a devtools console,
  with nothing imported.
- **`globalSettings.tracing`** controls capture: `capture` sizes an in-memory ring independently of
  `traceLog`, so a build whose console must stay clean can still produce a post-mortem dump, and `sink`
  forwards every record.
- Trace records are structured rather than lines of text. Each one names its model, path, owner and cache,
  which way a binding carried and whether it could carry back, and which of the three methods sent a bus
  message.

### Breaking changes

- **Mistakes that used to be logged now throw**, so they reach `globalSettings.errorHandler` instead of
  scrolling past in a console: assigning a non-function to an event, assigning to a declared method or
  child model, passing a binding for `cacheable`, two JSX siblings claiming the same `id`, and a parameter
  that switches between a binding and a value between renders.
- **`unicast` and `castTo` throw before dispatching** when more than one subscriber matches, instead of
  delivering to all of them and returning the first result. Exactly one answer is the contract.
- **A message that declares no payload now takes no argument.** `unicast("Msg")` compiles; the former
  `unicast("Msg", undefined)` placeholder is a compile error.
- **`draw` and `erase` must be synchronous.** `draw` is a layout effect, so an asynchronous one could never
  sequence anything and used to land after `mount`; a Promise from either is now rejected.
- **Parameters are applied differently to cached models.** A `children`-section constant is an initial
  value and is no longer re-asserted when a cached model remounts, which used to reset its state. A JSX
  prop is a standing declaration and is still re-applied.
- **`id` and `cacheable` are system props.** They no longer accept a binding or a getter, and no longer
  synthesise `onChangeId`, `onChangingId`, `onChangeCacheable` or `onChangingCacheable`.
- `hashHtmlId` is read from `globalSettings`, not from `window`.
- Extension lifecycle hooks chain synchronously unless a handler returns a Promise — the v2.0.6 rule for
  methods and events, now applied to hooks as well.

### Fixes

- **Bindings.** An `onChanging` rewrite now reaches the far end of a binding chain, instead of leaving the
  two ends on different values with nothing reported. A chain that cannot settle is bounded by
  `globalSettings.bindingRetries` and reports the divergence rather than retrying for ever.
- **Arrays through bindings** sync in place — `push` on the model's array now reaches the source — and are
  compared by identity rather than by value, which made them roughly twice as fast as before.
- **`React.StrictMode` is supported.** The mount count was raised during render, so a render React
  discarded inflated it permanently and `unmount` / `deinit` never ran, holding the model's bus
  subscription. That was a leak in ordinary use, which StrictMode merely made reliable to reproduce.
  Ownership is re-asserted so the parent React keeps owns its children, which keeps DOM ids, bus addressing
  and cache keys aligned.
- **A lifecycle hook that throws settles its phase and is not retried.** A throwing `mount` used to strand
  the model in "mounting": `unmount` was skipped and `mount` never ran again.
- **Model caching.** Every hook call owns a cache slot, so a `cacheable: false` child no longer makes its
  siblings adopt each other's models. `clearModelCache()` clears both caches of the model it is called on,
  recursively. Bookkeeping slips repair themselves and report, rather than crashing the application.
- **Component identity no longer depends on caching or on tracing.** A `cacheable={false}` child had the
  wrong `fullId()`, and turning tracing on changed owners.
- **A failing `View` is contained to its own component** instead of blanking the parent's subtree. The
  placeholder is configurable through `globalSettings.renderRetries` and opens a report with the detail.
- **`model.BaseViews`** gives an extension every level below it, root base first; `BaseView` remains
  `BaseViews[0]`. With three levels the middle `View` used to be unreachable.
- `clone()` no longer drops `0`, `""` and `false`, and no longer throws on a function.
- A `View` may return `null`, and a binding's getter may yield `undefined`.

### Documentation and tests

- The `docs/` folder shipped in the package is split into `docs/raw/` (the programming guide, the
  architecture and development sets, and the Mermaid diagram sources) and `docs/wiki/` (a concept wiki
  derived from them), with a checker that verifies every citation resolves and every inlined diagram
  matches its source.
- The guide was reconciled with the code wherever the two disagreed; the decisions are recorded in
  `docs/raw/development/DESIGN-CONFORMANCE-AUDIT.md`.
- **Agent skills for building applications ship with the package**, under `skills/`.
  `ueca-app-development` carries the component pattern — struct, hook, `getFC`, state and bindings,
  lifecycle, model caching, the message bus — and a symptom-indexed list of the mistakes that fail
  silently. `ueca-app-architecture` covers a whole application: a complete barebone app to scaffold from,
  where each concern belongs, and a staged plan for moving an existing React application onto the same
  architecture. Both are written against the public API alone, so they stay true for any consumer. Copy or
  symlink them into a project's `.claude/skills/` — `skills/README.md` has the one-liner.
- The test suite is now 384 tests across 38 files.

## v2.0.6

- All internal private members of the model now have a preffix "__$ueca$" to avoid collision with component structure members in the user's code.
- Bugfixes and improvements for chaininig sync/asysc event handlers and methods. In v2.0.5 chained functions always returned a promise.
  The logic is adaptive now. Chained sync functions return a value and async chained functions return a promise.
- Small readme updates.

## v2.0.5

 - npm audit fix (7 vulnerabilities fixed)  
  - Readme updates (links, new demo app)

## v2.0.4

 - UECA-REACT 2.0 initial release
