# Changelog

## v3.0.3

A tracing, packaging and documentation release. A binding writes a trace record only when a value actually
moves, the standalone viewer opens a trace named in its address, the agent skills install with a command of
their own, and the README leads with what the framework is for: applications that AI agents write and people
verify. No API changed.

### Tracing

- **A binding is traced only when a value moves.** A `bind` record says a value arrived through a binding,
  but both binding reactions wrote one whenever anything their getter read had changed — including when it
  worked out to the value the property already held. On a real capture, a menu of twenty-two items bound to
  the current route wrote twenty-one `false → false` records and one `true → true` on every click that kept
  the same item selected: 66 of 99 records, every one of them lighting a binding wire in the viewer. An
  inbound record is now written only when the value moves; outbound records are unchanged. A
  table-of-contents click on the documentation site traces 11 records now, not 33.

### Trace Viewer

- **The viewer opens a trace named in its address.** `trace-viewer.html#trace=<url>&view=<name>` opens on
  that trace and that view, and editing the address opens another. The trace has to come from the page's
  own origin, relative to the page, so a link can say `#trace=../../media/demo-trace.json`. When it cannot
  be read, the drop screen says why — including when the page was opened from disk, where the browser will
  not let it read the files beside it. The Tracing guide uses it to open a recorded session in a tab of its
  own.
- **The mark is the library's logo.** `<UECA.TraceViewerButton/>`, the overlay's title bar and the viewer's
  header draw the UECA logo — four jigsaw pieces round a centre — as vectors, where they drew four plain
  diamonds. The viewer's browser tab carries it as its icon, so a viewer opened in a tab of its own can be
  found again among the others.

### Agent skills

- **`npx ueca-react-skills` installs them.** The package ships two agent skills, and they land in
  `node_modules/ueca-react/skills/` where no agent reads. The new command copies them into
  `.claude/skills/`, **replacing** each skill directory rather than merging into it, so a file dropped in a
  later release cannot survive the upgrade — the `cp -r` the README used to suggest leaves it behind. Skills
  of your own in that directory are never read, moved or deleted.
- **`--dest` puts them where another agent looks.** The skills are tool-neutral Markdown about the
  component pattern and name no vendor; only each `SKILL.md`'s frontmatter is shaped for Claude Code's
  on-demand loading, and an agent that concatenates its rules into context simply reads past it. So
  `npx ueca-react-skills --dest .cursor/rules` is as valid as the default. It places files; it does not
  translate formats.
- **Installing the package still runs nothing.** There is deliberately no `postinstall` hook: a library
  writing agent instructions into a project as a side effect of `npm install` is what supply-chain tooling
  blocks, and it would be skipped anyway wherever install scripts are disabled — working for some consumers
  and silently not for others. Put `ueca-react-skills --auto` in a `postinstall` of your own if you want
  the copy kept in step; `--auto` means only "never fail the install".
- **The skills now point at the applications that already solve this.** They carried no outbound reference
  of any kind — not even to the framework documentation shipped beside them in the same package. A new
  `reference-apps.md` indexes the three published applications by problem: which folder in the Showcase demo
  holds a validating input, a virtualised table, a theme manager, a tooltip singleton, and six techniques
  worth copying.
- **The barebone scaffold speaks the vocabulary the reference applications use.** It declared
  `UI.Dialog.Info`, `Nav.GoTo` and a generic `Api.Get` where every published app says
  `Dialog.Information`, `App.Router.GoToRoute` and one entry per operation — so a component lifted out of
  one of them had to be translated before it compiled. The ids line up now, and a new section 8 catalogues
  the infrastructure modules a real application adds on top: storage, theming, alerts, tooltips, security,
  browsing history, file selection, each with its contract entries and its owner.
- **Using UECA inside an application that stays React is a supported outcome**, not a stalled migration.
  The migration guide said so in seven stages ending in purity; it now names the stopping point, and the
  architecture skill carries it as a path of its own.
- **A guide to testing a component.** The fact that makes a UECA test work — a component draws nothing on
  its first render, so the mount has to be awaited — was written down nowhere. It ships with a
  mount-and-settle harness on the public API and the technique for faking a service.

### Documentation

- **The README leads with AI-agent development**: a *Built for AI agents* section and badge up front, with
  the agent skills and how to install them. The Storybook demo is the **Showcase** now, and the demos are
  listed Showcase, documentation site, MUI. The trace-viewer animation is re-recorded at 1920×1080, in full
  motion, from the Graph view replaying a recorded session.
- **The Tracing guide is rewritten around the viewer** — task-oriented, 235 lines where it had grown to 565.
  It opens on a screenshot that links into a recorded session of the documentation site, and each of the
  five views it describes links straight into that session.
- **Struct sections and lifecycle hooks are declared in one order everywhere.** The guide, the code
  template, the shipped skills and `index.d.ts` agree: `props`, `children`, `methods`, `events`,
  `messages`, the hooks in the order they run — `constr`, `init`, `draw`, `mount`, `erase`, `unmount`,
  `deinit` — then `View`. The runtime reads sections by name, so no application has to change; this is the
  order the documentation shows and an agent copies.
- **The shipped documentation no longer names library source files.** Five notes in the guide explained an
  error and ended with the library module that raises it, and a comment in the viewer page did the same.
  The package carries no library source, so those were pointers a reader could not follow. The error
  messages they quote are unchanged.
- The test suite is 393 tests across 38 files.

## v3.0.2

A trace-viewer release. The library bundle is unchanged — no API moved, nothing behaves differently in an
application. Everything here is in the viewer page, in the picture it saves, and in the README.

### Trace Viewer

- **The component filter hides in the Graph and the Tree**, where it used to dim. The table, the timeline
  and the sequence always hid what it took out; the two hierarchy views were the odd ones. They stay
  hierarchies because an owner is drawn whenever anything under it is drawn, so two components singled out
  of different branches each still read where they sit — and `hide` still takes the subtree with it.
- **Only the component filter decides what is on the picture.** Kinds, text and the strip's range say what
  happened rather than what exists, so narrowing to `kind:diag` no longer empties the map of the
  application. They do reach the wires, which are about what happened: switch `bus` off and the messaging
  lines go. A wire is drawn only while a record that went down it is in view, and only with both of its
  ends on the picture.
- **`on screen only`**, in the Components popover beside Clear. A router application builds its layout once
  and swaps the middle, so navigating five times leaves the graph holding five screens of which one still
  exists. The trace says which — `init` checks a model in, `deinit` checks it out — and the picture is
  drawn as the application stands at the play head. Moving the head redraws it. On one real capture: 79
  components with the head at the start, 17 with it at the end.
- **A saved SVG answers questions now.** Every element that has a tooltip in the page carries a native
  `<title>` in the exported file, so hovering a bus line, a binding or a component works on a diagram
  dropped into a documentation folder — with no script in the file. The hoverable strip along each route
  is kept: a drawn wire ignores the pointer, so the strip is the only thing on a route that can be hovered
  at all, and without it every line in an exported file was dead.
- **Tooltip labels end in a colon** — `message: App.Ping` rather than `message App.Ping`. On the page a
  label is told from its value by being dim; a `<title>` in a saved picture is plain text with no colour to
  spend.

### Documentation

- The README now points at the live demos as somewhere to press `<UECA.TraceViewerButton/>`. All three
  ship it, so the viewer is one click away on a running application whose source is on GitHub beside it.
- The v3.0.1 entry below described the shipped `docs/` folder as carrying the concept wiki and the
  architecture and development sets. It never did, and that bullet is corrected in place — see it for what
  the package actually contains.
- The test suite is 391 tests across 38 files.

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

- The `docs/` folder shipped in the package carries the programming guide (`docs/raw/original/`) and the
  standalone trace-viewer page (`docs/tools/trace-viewer.html`). The architecture and development sets, the
  Mermaid diagram sources and the concept wiki derived from them stay in the development repository — they
  cite the library's source line by line, and this package ships no source. A checker there verifies that
  every citation resolves and every inlined diagram matches its source.
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
