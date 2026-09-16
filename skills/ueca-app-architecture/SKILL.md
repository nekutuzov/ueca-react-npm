---
name: ueca-app-architecture
description: >
  Stand up a complete UECA-React application, or move an existing React application onto the same
  architecture. Use this skill when the task is bigger than one component: "create a new UECA app",
  "start a project with ueca-react", "scaffold an app", "set up the app shell", "add routing / a
  layout / a screen system", "where do services go", "wire up dialogs and a busy indicator", "give me
  a template", "convert this app to UECA", "migrate our React app off Redux/Context/useEffect", or
  "refactor this to pure UECA architecture". Also use it for architecture questions in an existing
  UECA app — "should this be a service or a component", "how do screens reach the API", "why is this
  a base hook", "we have two ways of doing X" — and before creating anything under a `core/`,
  `infrastructure/`, `base/` or `screens/` folder. For writing or fixing a single component, use
  `ueca-app-development` instead; this skill assumes it and builds on top.
---

# Pure UECA application architecture

A "pure" UECA application is one where **the component model is the only architecture**. There is no
store, no context, no effect graph, no service-locator, no dependency-injection container — because a
UECA model already is a long-lived object with state, lifecycle, methods and a public message
interface. Adding any of those back means running two architectures at once.

This skill builds that application, or converts an existing one to it. For the component pattern
itself — struct, hook, `getFC`, bindings, lifecycle — use `ueca-app-development`; everything here
assumes it.

## What "pure" actually constrains

Five rules. Everything else in this skill follows from them.

1. **State lives on models.** Not in a store, not in module-level variables, not in React state. A
   value that two components need either crosses through a binding or is owned by a model that both
   reach over the bus.
2. **Non-visual work is a component too.** An API client, a router, a dialog host, a storage adapter
   — each is an ordinary UECA component with `messages:` handlers and `View: () => null`. This is the
   single biggest shift from a React codebase, and the one that removes the most machinery.
3. **Composition over configuration.** A component exposes `*View` slots that its **owner** fills with
   its own children's Views. Menu items, toolbar buttons and rows are child models on the component
   that owns them — never config arrays that a host interprets. A config array caps expressiveness at
   whatever the schema anticipated; a slot inherits the whole component model for free.
4. **Reach down, or reach over the bus.** A parent drives its children directly. Everything else is a
   message. A component never reaches upward and never imports a sibling.
5. **No React API in application code** — no `useState`, `useEffect`, `useContext`, `useReducer`, no
   class components, no direct DOM access outside a `draw`/`mount` hook. The component hook is the
   only React feature you use.

## The layers

```
main.tsx                    bootstrap: settings, error handler, render root
  └── Application           root model — owns the services and the UI
        ├── services        ApiService, storage, security… View: () => null, reached over the bus
        └── AppUI           the shell — owns dialogs, busy, alerts, and the router
              └── AppRouter route → screen
                    └── AppLayout      chrome: top bar, side menu, content slot
                          └── Screen   a ScreenBase component, one per route
                                └── components
```

Beneath all of it sits a **base-hook chain** — the app's own component vocabulary, each level
extending the one below with `UECA.useExtendedComponent`:

```
useBase        shorthand methods every component wants (dialogs, busy, navigation) — no UI
  └── useUIBase       visual concerns (extent, z-index)
        ├── useEditBase    an editable entity: validation, modelsToValidate
        └── useScreenBase  a route-mounted screen: routeParams
```

**Why the chain matters:** it is what stops every component from re-deriving how to open a dialog or
show a spinner. A component calls `model.dialogYesNo("Delete?", "Are you sure?")` without importing
the dialog manager, knowing it exists, or handling the bus itself. Extend the **narrowest** base that
fits.

## Three paths

Pick by what you are starting from — and note that **Path C is a supported end state, not a stalled
Path B.** A React application that simply uses UECA components is a legitimate, common outcome.

### Path A — a new application

Read `reference/scaffold.md` and write the files it lists, in the order it lists them. It is a
complete, runnable barebone app: bootstrap, message contract, the four base hooks, the shell, a
router, a screen layout, one screen, and the dialog/busy/API services. Nothing in it is optional
decoration — remove a piece and something above it stops working.

Then:

1. Check it runs and the sample screen shows.
2. Add your real routes to `appRoutes.tsx` and a screen per route.
3. Add your real messages to `appMessage.ts` before the code that sends them.
4. Add the infrastructure modules you need — storage, theming, alerts, tooltips, sign-in — from
   section 8 of `reference/scaffold.md`. Each is one component you install by owning it.
5. Grow the component library under `components/`, extending `useUIBase` or `useEditBase`.

Before writing any of it by hand, check `reference/reference-apps.md`: most controls and every one
of those services already exist, written this way and under test, in a published application.

Do not add a state library, a router library, a DI container or a UI kit while doing this. If one
seems necessary, the architecture is being fought rather than used — check `reference/architecture.md`
for where that concern already lives.

### Path B — an existing React application

Read `reference/migration.md`. The short version: **UECA and React interoperate in both directions**,
so this is incremental, not a rewrite. `UECA.getFC(useX)` yields an ordinary React component you can
drop into a React tree today, and a UECA `View` can render any React JSX including your existing
components. That two-way bridge is what makes a staged migration possible.

The staged order is: bootstrap coexistence → message contract + base chain → leaf controls →
screens → the shell → delete the React scaffolding.

### Path C — components only, inside an app that stays React

Stages 0–2 of `reference/migration.md` and nothing more: set the error handler, write
`appMessage.ts` and the base chain, then write new controls as UECA components and use them through
`UECA.getFC` wherever React expects a component. Keep your router, your store and your screens.

This is the fastest way to get value out of the library, and the rest of this skill still applies to
everything you write — the component pattern, the base chain, the bus. Go further when the React
side starts fighting you, not on a schedule.

## Build order, and why it is this order

Each step depends only on the ones above it, so each is independently runnable.

| # | Step | Why here |
| --- | --- | --- |
| 1 | `appMessage.ts` — the message contract | it is the app's wiring; everything else names entries in it |
| 2 | `appStart.tsx` + `main.tsx` — bootstrap | gives you something that renders |
| 3 | the base chain (`base` → `uiBase` → `editBase` / `screenBase`) | every component below extends it, so changing it later touches everything |
| 4 | services (dialogs, busy, API) | the base chain's shorthand methods are calls **into** these |
| 5 | `Application` + `AppUI` | owns the services so they mount for the app's lifetime |
| 6 | router + routes + layout | now a screen has somewhere to appear |
| 7 | `ScreenLayout` + the first screen | the pattern every later screen copies |
| 8 | the component library | grown as screens need it, not up front |

Step 3 before step 4 is the one that looks wrong and is not: the base hook only *calls* the services
over the bus, so it compiles and runs before any of them exist — an unhandled message is not an
error.

## Reference

| File | Read it when |
| --- | --- |
| `reference/scaffold.md` | you are creating a new app — the complete barebone skeleton file by file, then the infrastructure modules (section 8) |
| `reference/architecture.md` | deciding where something belongs, or why a layer exists |
| `reference/migration.md` | converting an existing React app, or adopting without converting |
| `reference/reference-apps.md` | **three complete published applications** — what each solves and where to find it. Look here before writing a control, a service or a screen from scratch |

Beyond this skill, two things ship with the library itself:

- the full framework documentation, at `node_modules/ueca-react/docs/raw/index.md` and online at
  <https://nekutuzov.github.io/ueca-react-doc/>;
- the `ueca-app-development` skill, which owns the component pattern this one assumes.

## Conventions this architecture assumes

- **One folder per component**, named for it, holding the component and its CSS.
- **`core/`** holds the shell and the infrastructure services; **`components/`** the reusable library;
  **`screens/`** the route-mounted screens; **`api/`** the service that talks to the server.
- **Barrel exports** (`index.ts`) per area, so a screen imports from `@components`, never by deep path.
- **A screen never calls `fetch`.** It sends a message; the API service owns the transport.
- **JSX with a long attribute list gets one attribute per line**, closing bracket on its own line.
- Route ids are explicit and stable: `<HomeScreen id="homeScreen" />`.

## Before you call it done

This checklist is for a **pure** application — Path A, or Path B all the way through. On Path C the
first three items are about your own UECA components, not the host app.

- [ ] `npm run build` (or the project's equivalent) passes, and the app renders.
- [ ] No `useState`, `useEffect`, `useContext`, `useReducer` or class component anywhere in `src/`.
- [ ] No state library, no router library, no DI container.
- [ ] Every non-visual concern is a component with `View: () => null`, reached only over the bus.
- [ ] Every component extends the narrowest base that fits — nothing calls `UECA.useComponent`
      directly except the base chain itself.
- [ ] Every message a component sends is declared in `appMessage.ts`.
- [ ] Every screen is registered in `appRoutes.tsx` with a stable, explicit `id`.
- [ ] `UECA.globalSettings.errorHandler` is set once, before the first render.
