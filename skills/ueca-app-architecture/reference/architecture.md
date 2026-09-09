# The architecture, and why it is shaped this way

## Two rings

An application has a **visual ring** that nests from the root down to a leaf control, and a
**non-visual ring** that renders nothing and is reached only over the message bus.

```
Application ─┬─ services ······ non-visual ring: View: () => null, reached by message
             │                   ApiService, storage, security, theming, timers
             └─ AppUI ────────── visual ring: nests down to controls
                   ├─ dialogs, busy, alerts   (visual services — they draw when asked)
                   └─ AppRouter → AppLayout → Screen → panels → controls
```

The separation is the load-bearing idea. A screen writes:

```ts
if (await model.dialogYesNo("Delete site?", "This cannot be undone.")) { … }
```

…and does not import the dialog manager, does not know it exists, and does not know where it is
mounted. Swap the dialog implementation and no screen changes.

## Why a service is a component

A React codebase reaches for a context provider, a singleton module, or a DI container. UECA needs
none of them, because a model already is what those things are trying to supply: a long-lived object
with state, a lifecycle, and a public interface.

| A service needs | A UECA model already has |
| --- | --- |
| to exist once | one model, owned by `Application`, cached for the app's lifetime |
| startup / shutdown | `constr` / `init` / `deinit` |
| to be reachable from anywhere | `messages:` handlers on the bus |
| internal state | props — observable, so a view watching them updates |
| to be replaceable in tests | a different subscriber for the same message id |

So: `View: () => null`, a `messages:` section, owned by `Application`. Nothing imports it.

**A service that draws** — a dialog host, a toast stack, a busy overlay — is the same thing with a
real `View`, owned by `AppUI` so it sits above the screen in the DOM.

## The base chain

Four hooks, each extending the one below with `UECA.useExtendedComponent(struct, extStruct, params,
baseHook)`. This is the application's own component vocabulary.

| Hook | Extend it for | Gives you |
| --- | --- | --- |
| `useBase` | anything with no UI — services, managers, controllers | the shorthand methods: dialogs, busy, navigation |
| `useUIBase` | any component that draws | the above, plus visual concerns (extent, class, z-index) |
| `useEditBase` | an editable **entity** — one field, or a form of fields | the above, plus `validate` / `isValid` / `modelsToValidate` |
| `useScreenBase` | a route-mounted screen | the above, plus `routeParams`, `refresh` |

**Pick the narrowest one that fits.** Nothing in the application calls `UECA.useComponent` directly
except the base chain itself — that is the rule that makes the chain worth having.

Two things the chain buys that are easy to underestimate:

- **A cross-cutting change is one edit.** Adding `alertSuccess(...)` to `useBase` gives it to every
  component in the app at once.
- **`modelsToValidate` composes.** A form extends `useEditBase` and lists its fields; validating the
  form validates the fields, and a screen that lists the form validates everything below it. No
  validator side-car, no schema library.

### How a level is written

Every level is the same five declarations. `XPartialStruct` is *this level's* contribution;
`XStruct<T>` is the type an extending component writes against.

```ts
type UIBasePartialStruct = BaseStruct<{ props: { … }; methods: { … } }>;

type UIBaseStruct<T extends UECA.GeneralComponentStruct> = UIBasePartialStruct & BaseStruct<T>;
type UIBaseParams<T extends UIBasePartialStruct = UIBaseStruct<UECA.GeneralComponentStruct>> = BaseParams<T>;
type UIBaseModel<T extends UIBasePartialStruct = UIBasePartialStruct> = BaseModel<T>;

function useUIBase<T extends UIBasePartialStruct>(extStruct: T, params?: UIBaseParams<T>): UIBaseModel<T> {
    const struct: UIBasePartialStruct = { … };
    return UECA.useExtendedComponent(struct, extStruct, params, useBase);   // ← 4th arg chains the level
}
```

Omit the fourth argument and the level silently detaches from everything beneath it.

## Composition over configuration

**The main organizing rule.** A component exposes `*View` slots; its **owner** fills them with the
Views of the owner's own children.

```tsx
// The owner declares the pieces as real children…
children: {
    layout: useScreenLayout({
        title: () => model.title,
        toolbarView: () => <model._ToolbarView />,
        contentView: () => <model._ContentView />,
    }),
    saveButton: useButton({ caption: "Save", onClick: () => void model.save() }),
},

// …and composes them in a *View method.
methods: {
    _ToolbarView: () => (
        <>
            <model.saveButton.View />
            <model.refreshButton.View />
        </>
    ),
},
```

The alternative — `<Toolbar buttons={[{ caption: "Save", onClick: … }]} />` — looks smaller and caps
what a toolbar can ever hold. The first time a button needs a badge, a dropdown, a disabled reason or
its own loading state, the config schema grows a field, and every consumer of it is now coupled to
that schema. A **slot** inherits the entire component model — reactive props, state, lifecycle,
events, its own children — for free.

Apply it to menus, toolbars, table rows, list items, tabs, form fields. Reach for a config array only
for genuinely uniform, data-shaped content, and even then prefer a `*View` method mapping over the
data.

## Where does it go?

| The thing | Where |
| --- | --- |
| server call | an entry in `appMessage.ts`, a handler in `apiService.tsx` |
| a value two sibling components need | a prop on their common parent, bound into both |
| a value the whole app needs | a prop on a service model, read over the bus |
| navigation | `goToRoute(...)` from the base chain; the router owns the URL |
| a dialog, toast, spinner | a shorthand method on `useBase`, handled by a service |
| a new page | a `useScreenBase` component in `screens/` + a line in `appRoutes.tsx` |
| a reusable control | a `useUIBase` component in `components/` |
| an input or form | a `useEditBase` component — validation included |
| a one-off variant of a control | a factory hook calling the control's hook with preset params |
| new behaviour on top of a control | `useExtendedComponent` against the control's struct |
| a timer, a subscription, an abort controller | a `__`-prefixed prop, started in `init`, released in `deinit` |
| styling | a CSS file beside the component; tokens in one place, never literals |

## What not to add, and where that concern already lives

| Reflex | It already exists as |
| --- | --- |
| Redux / Zustand / MobX store | props on a model — a service model when it is app-wide |
| React Context | the message bus, or a binding |
| React Router | `AppRouter` + `appRoutes.tsx`; the route table is a plain object |
| a DI container / service locator | `messages:` handlers — the message id *is* the interface |
| `react-hook-form` / a validation schema library | `useEditBase` + `modelsToValidate` |
| `useMemo` / `useCallback` / `React.memo` | nothing — models persist, and only views that read a value re-render |
| an event emitter | the bus |
| a `useEffect` for data loading | the `init` hook |

If one of these still seems necessary, say what it would own that no model owns. Usually the answer
names a model that has not been created yet.

## Ownership and lifetime

- **`Application` owns the non-visual services**, so they mount once and live as long as the app.
- **`AppUI` owns the visual services and the router**, so overlays sit above the screen.
- **A screen owns its panels; a panel owns its controls.** Ownership is the DOM order and the
  `fullId()` path at the same time.
- **A model outlives its element.** Caching is on by default, so navigating away from a screen and
  back returns the same model with its state intact. Reset per-visit state in `init`, not `constr`.
- **A dynamically rendered child needs a stable, unique `id`** — derive a list child's from its item.

## Identity is the app's addressing scheme

`fullId()` — `app.ui.router.siteScreen.nameField` — is at once the DOM id, the trace path, the bus
address and the model cache key. Three consequences worth designing for:

- **Tests and e2e select by model path**, not by CSS class or text. `getByTestId("app.ui.router.siteScreen.nameField")`
  addresses a component by its position in the architecture.
- **`broadcast` takes a `RegExp` over it**, so "every input on the current screen" is expressible:
  `model.bus.broadcast(/^app\.ui\.router\.[^.]+\..*Field$/, "UI.Screen.DisableControls")`.
- **A component that delegates its whole View to a child still needs its own root element**, or it
  has no address. Wrap in a `display: contents` element carrying `id={model.htmlId()}`.

## Testing follows the architecture

- A screen is testable without a server: subscribe a stub to the `Api.*` messages instead of mounting
  `ApiService`.
- A control is testable alone: render it with `getFC` and drive its model.
- A service is testable with no UI at all: mount it and send it messages.
- Nothing needs a provider wrapper, because nothing depends on context.

## The one place state may leave a model

Occasionally a value belongs to the whole app rather than to any one model — a modal stacking order,
for instance, where a dialog opened over a drawer must sit above it and neither owns the other. A
module-level variable is defensible **only** when nothing renders from it: the value is read
synchronously, copied onto a model, and never observed. The moment a view reads it, reactivity is
lost silently, and it must become model state.

Treat this as a last resort that needs a comment explaining why, not as an escape hatch.
