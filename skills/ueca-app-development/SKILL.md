---
name: ueca-app-development
description: >
  Build anything in an application that uses the UECA-React library — a single component, a group of
  components that work together, or a whole application from its entry point up. Use this skill whenever
  the task is to create, add, extend, refactor, split or fix a component, panel, control, widget, dialog,
  form, field, screen, page or service in a project that depends on `ueca-react`; whenever a feature
  plainly needs one ("add a status badge", "make this reusable", "pull that panel out"); and whenever you
  are about to write a `useXxx` hook, a `UECA.getFC` call, a `ComponentStruct` type, a `UECA.bind(...)`
  or a `messages:` handler. Use it too for anything that smells like reactivity going wrong — "the view
  doesn't re-render", "my model isn't updating", "state resets when I navigate away", "the input loses
  focus", "this prop is stale", "the handler never fires", "onChange fires too many times". Read it
  BEFORE writing UECA code, not after the first attempt fails.
---

# Building with UECA-React

UECA components are **not** React components with a different accent. Almost every mistake in a UECA
codebase is a React habit carried across. Read the rules below before writing code, because most of what
goes wrong here fails *silently* — no error, no warning, just a view that never updates.

> This skill covers the **library**. If your project also ships skills for its own app template — base
> hooks, layout primitives, screen conventions, routing — those are a layer on top of this one and they
> win where they disagree about the template. Nothing here prescribes a folder layout or an app skeleton.

## The one idea

A React component is a **function re-run on every render**, which is why it needs `useState` to remember
anything and `useEffect` to do anything. A UECA component is a **model that persists** — an object with
properties, children, methods and events that is created once, and a `View` that draws it. The view
re-runs; the model does not.

Everything follows from that:

| You want to… | React | UECA |
| --- | --- | --- |
| hold state | `useState` | declare a prop; assign it with `=` |
| react to a change | `useEffect` + deps | nothing — views re-render from what they read |
| run setup once | `useEffect(…, [])` | the `constr` lifecycle hook |
| clean up | effect return | the `deinit` / `unmount` hooks |
| share state | lift it, or a store | a `bind()` between two models |
| talk across the tree | context, or a store | the message bus |

**In application code, the component hook is the only React feature you use.** No class components, no
`useState`, no `useEffect`, no `useRef`, no direct DOM manipulation. JSX itself is expected, and any React
component library can be wrapped inside a `View`. If you reach for a React hook, you have missed a UECA
feature — find it before writing the hook.

## The canonical component

Every component is exactly three declarations plus two type aliases. Do not vary the shape.

```tsx
import * as UECA from "ueca-react";

// 1. What the component declares.
type CounterStruct = UECA.ComponentStruct<{
    props:    { caption: string; count: number; step: number };
    methods:  { increment: () => void };
    events:   { onReachedLimit: (value: number) => void };
}>;

type CounterParams = UECA.ComponentParams<CounterStruct>;   // what a caller may pass
type CounterModel  = UECA.ComponentModel<CounterStruct>;    // what the hook returns

// 2. The model hook.
function useCounter(params?: CounterParams): CounterModel {
    const struct: CounterStruct = {
        props: {
            id: useCounter.name,        // ALWAYS first
            caption: "",
            count: 0,
            step: 1,
        },

        methods: {
            increment: () => { _bump(); },
        },

        events: {
            // Never declared — synthesised for every prop.
            onChangeCount: (value) => {
                if (value >= 10) model.onReachedLimit?.(value);
            },
        },

        View: () => (
            <div id={model.htmlId()}>
                <span>{model.caption}: {model.count}</span>
                <button onClick={() => _bump()}>+{model.step}</button>
            </div>
        ),
    };

    // Declared AFTER the struct that closes over it. Later calls return the same model.
    const model = UECA.useComponent(struct, params);
    return model;

    // Private methods
    function _bump() {
        model.count += model.step;
    }
}

// 3. The functional component, for use in JSX.
const Counter = UECA.getFC(useCounter);

export { type CounterModel, useCounter, Counter };
```

**Section order is fixed**, in the `XStruct` type and in the struct literal alike: `props` → `children` →
`methods` → `events` → `messages` → lifecycle hooks → `View`. The hooks go in the order they run: `constr` →
`init` → `draw` → `mount` → `erase` → `unmount` → `deinit`. Leave out whatever the component does not need
and keep the rest in this order. Private helpers go after `return model;`, prefixed `_`.

**JSX formatting:** an element with a long list of attributes gets **one attribute per line**, with the
closing `>` or `/>` on its own line. This is about reading the attribute list, not about line length —
apply it whenever the list is long, even where it would still fit. Short elements stay on one line.

```tsx
<Button
    caption="Save"
    disabled={!model.isValid()}
    onClick={() => model.save()}
/>
```

## Rules that are not style

Each of these fails silently or throws far from the cause. They are the reason this skill exists.

1. **`const model = …` comes after the struct.** The struct closes over `model`; its handlers and `View`
   only run later, by which time `model` is assigned. This looks like a bug and is not.
2. **`id: useX.name` is the first prop, and `id={model.htmlId()}` goes on the root element.** Identity is
   the DOM id, the trace path, the bus address and the model cache key *at once*. Skipping it costs all
   four.
3. **Every model prop is `T | undefined`.** A prop may be unseeded, and a bound one holds `undefined` until
   its binding first runs. Application code is written on the premise `strictNullChecks: false`; read with
   care (`model.items?.length ?? 0`) rather than fighting the compiler.
4. **Never call a component hook conditionally.** The model cache for hook-created children is
   *positional* — the same constraint as React's rules of hooks, and it breaks quietly.
5. **Optional-call every event:** `model.onClick?.()`. Events are unset until a caller supplies one.
6. **Names must be unique across `props`, `children`, `methods` and `events`.** They share one namespace;
   a collision throws at construction.
7. **A `children`-section constant is an initial value; a JSX prop is a standing declaration.** If a child
   must *follow* something, pass a binding or a getter, not a constant.
8. **No `try/catch` around UECA operations.** Errors are collected centrally — set
   `UECA.globalSettings.errorHandler` once at startup instead.

## Pick your scale

### One component

Copy the template above, then decide only these things:

- **Which props?** Anything the owner may set or read. Each one gets `onChange<Prop>` / `onChanging<Prop>`
  for free — do not declare them.
- **Which methods?** What the owner may ask it to do.
- **Which events?** How the component reports *upward*. A child never reaches its parent directly.
- **Does it need private, non-reactive state?** Prefix the prop `__` — it is a plain value, with no
  events, no bindings and no re-render.
- **Is a variant enough?** If you only need preset props, write a *factory* (a hook calling the existing
  hook), not a new component. If you need new behaviour on top of a base, use `useExtendedComponent`.
  → `reference/component.md`

### A group of components

A parent owns children. The question is always *how they are wired*:

| Situation | Channel |
| --- | --- |
| parent drives child | direct — `model.childName.doThing()` |
| child reports upward | an event the parent supplied |
| one property must stay in sync | `UECA.bind(...)` passed in params |
| component needs a service, or is not an ancestor/descendant | the message bus |
| something app-wide must be announced | `bus.broadcast(...)` |

**Child → parent by reaching upward is not a channel.** It is technically possible and it makes the child
unreadable in isolation. Use an event.

Declare children in the `children` section when the set is fixed; render them as JSX when the set is
data-driven, and give every one an explicit, item-derived `id` — siblings may not share one.
→ `reference/application.md`

### A whole application

Build it in this order. Each step is independently checkable.

1. **The message contract** — one file, one `type AppMessage = { … }`. Every service call, dialog and
   global announcement is an entry. Do this first; it is the app's public wiring.
2. **The entry point** — set `UECA.globalSettings.errorHandler` (and `traceLog` in development) *before*
   the first render, then render your root component into the DOM.
3. **Non-visual services as ordinary components** — an API client, a storage adapter, a dialog host. They
   declare `messages:` handlers and a `View` that returns `null`. Nothing imports them; they are reached
   over the bus.
4. **The root component** — owns the services as children, plus the visual tree.
5. **Screens and panels** — ordinary components, composed downward.
6. **Leaf controls** — buttons, fields, badges. Extend a shared base for cross-cutting behaviour such as
   validation.

→ `reference/application.md` for the bootstrap, the bus and the service pattern. For the folder
layout, the base-hook chain and the shell around all this, use `ueca-app-architecture`.

### A component inside an app that stays React

You do not have to convert anything. `UECA.getFC(useX)` returns an ordinary React component, so a
UECA component drops into an existing React tree as it is — and a UECA `View` renders any React JSX,
including components you are not touching. Adopting the library for new controls, while the host app
keeps its router and its store, is a supported end state rather than a half-finished migration.

Two things to set up once, and then nothing else changes:

```ts
// At your existing entry point, before the first render.
UECA.globalSettings.errorHandler = (error) => { /* your reporter */ };
UECA.globalSettings.traceLog = import.meta.env.DEV;
```

```tsx
// Then use it like any other component. Give it an explicit, stable id.
const StatusBadge = UECA.getFC(useStatusBadge);

<StatusBadge
    id={`status-${order.id}`}
    status={order.status}
/>
```

**The one rule at the boundary:** a value is owned by the model *or* by React state, never both. A
React component that reads a model's properties re-renders only if it is wrapped —
`UECA.observe(MyComponent)` — so the simpler arrangement is to keep the read inside a UECA `View`.

→ `ueca-app-architecture`, `reference/migration.md` for the staged path onward, if you ever want it.

## Reference

Load the file that covers what you are actually doing. Do not guess an API — check it.

| File | Covers |
| --- | --- |
| `reference/public-api.md` | **everything importable from `ueca-react`**, and every built-in model member. Check here before using any `UECA.*` name |
| `reference/component.md` | one component in depth — struct sections, reserved and private props, `*View` slots, lifecycle hooks, extension, factories |
| `reference/reactivity.md` | state and assignment, arrays and `observe()`, the automatic property events, bindings in all four forms |
| `reference/application.md` | composition, identity, model caching, the message bus, bootstrap, global settings, error handling, tracing |
| `reference/pitfalls.md` | **symptom → cause → fix.** Read this first when something already misbehaves |
| `reference/testing.md` | testing a component — the mount-and-settle harness, collecting swallowed errors, faking a service |

Two more sources, outside this skill:

- **The framework documentation**, shipped in the same package — `node_modules/ueca-react/docs/raw/index.md`,
  and online at <https://nekutuzov.github.io/ueca-react-doc/>. Deeper than these pages on any single topic.
- **Three complete published applications.** Before writing a control from scratch, check whether one
  already exists: [demo2](https://github.com/nekutuzov/ueca-react-app-demo2) alone carries some fifty
  components — inputs with validation, a virtualised table, dialogs, drawers, menus, breadcrumbs — each
  with its tests beside it. `ueca-app-architecture`, `reference/reference-apps.md` indexes them by
  problem.

## Before you call it done

- [ ] The three declarations and two aliases are all present, named `XStruct` / `XParams` / `XModel` /
      `useX` / `X`, and the model type, hook and component are exported.
- [ ] `id: useX.name` is the first prop; `id={model.htmlId()}` is on the root element.
- [ ] Struct sections are in order — in the type and in the literal, with the hooks in the order they run;
      `const model = …` follows the struct.
- [ ] No `useState`, no `useEffect`, no class component, no direct DOM access.
- [ ] Every event is called optionally (`?.()`); every prop read tolerates `undefined`.
- [ ] No component hook is called inside a condition or a loop.
- [ ] Dynamically rendered children each carry a unique, item-derived `id`.
- [ ] Anything shared with another component goes through a binding, an event or the bus — never a
      reach upward and never a module-level mutable.
- [ ] The project's own type-check and tests pass.

If something still misbehaves, go to `reference/pitfalls.md` before changing the design — the failure is
almost certainly on that list.
