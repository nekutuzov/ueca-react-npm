# Migrating an existing React application

This is a **staged migration, not a rewrite**. The application keeps running and shipping the whole
way through.

## Why it can be incremental

UECA and React interoperate in **both** directions, and that is the entire basis of the plan:

```tsx
// A UECA component IS a React component — drop it into any React tree today.
const MyPanel = UECA.getFC(useMyPanel);
function LegacyScreen() {
    return <div><MyPanel id="myPanel" title="Hello" /></div>;
}
```

```tsx
// …and a UECA View renders any React JSX, including components you have not migrated.
View: () => (
    <div id={model.htmlId()}>
        <LegacyChart data={model.rows} />
    </div>
)
```

So a component can move in either direction independently, and the boundary can sit anywhere in the
tree. There is no flag day.

**The one constraint:** a UECA model cannot be driven by React state, and a React component cannot
subscribe to a model's observables unless it is wrapped in `observer`. Keep ownership of any given
piece of state on exactly one side of the boundary at a time — that is what makes each step safe.

## You do not have to finish

The stages below end in a pure UECA application, and that is worth reaching. But **stopping is a
supported outcome, not an unfinished migration.** Two end states are legitimate:

| End state | What you keep | What you get |
| --- | --- | --- |
| **Adopt** — stages 0–2 | your router, your store, your providers, your screens | a component library written the UECA way, used from React like any other component |
| **Convert** — stages 0–6 | nothing of the scaffolding | one architecture instead of two |

**Adopt** is the smaller commitment and the usual starting point. It is done when:

- `UECA.globalSettings.errorHandler` is set at your existing entry point (stage 0),
- `appMessage.ts` and the base chain exist (stage 1),
- and new controls are written as UECA components and used through `getFC` (stage 2).

That is it. Your React app keeps its store and its router; each UECA component is a self-contained
model that happens to render. Nothing forces stage 3.

```tsx
// An adopted component, dropped into a React screen that is not going anywhere.
const StatusBadge = UECA.getFC(useStatusBadge);

function LegacyOrderRow({ order }: { order: Order }) {
    return (
        <tr>
            <td>{order.reference}</td>
            <td>
                <StatusBadge
                    id={`status-${order.id}`}
                    status={order.status}
                />
            </td>
        </tr>
    );
}
```

The one rule that still applies: **keep ownership of any piece of state on one side of the
boundary.** A UECA model may be fed from React props on each render, or it may own the value — never
both. Everything in "Traps specific to migration" below is really a consequence of that.

Go on to stage 3 when the friction is on the React side — when a value has to be threaded through
four components, when a context provider exists only to reach a service, when a `useEffect` is
fighting a model. Those are the signals; the calendar is not.

## The staged plan

Each stage leaves the app shippable. Do not start the next until the previous is merged.

### Stage 0 — install and coexist

```bash
npm install ueca-react mobx mobx-react
```

Set the global settings once at your existing entry point, before the first render:

```ts
UECA.globalSettings.traceLog = import.meta.env.DEV;
UECA.globalSettings.errorHandler = (error) => { /* your existing reporter */ };
```

Nothing else changes. Your app still boots through React.

### Stage 1 — the message contract and the base chain

Write `appMessage.ts` and the four base hooks from `reference/scaffold.md`. They compile and run with
no services behind them — an unhandled message is not an error, `unicast` returns `undefined`.

This stage adds no behaviour. It exists so that everything migrated afterwards is written against the
final vocabulary rather than being migrated twice.

### Stage 2 — leaf controls

Migrate buttons, inputs, badges, cards — the components with the most reuse and the least state.
Extend `useUIBase`, or `useEditBase` for anything editable. Each one becomes usable from React
immediately via `getFC`, so you can swap call sites one at a time.

Do this before screens: a migrated screen wants migrated controls, and the reverse is not true.

### Stage 3 — services

Move the API layer, storage, auth and theming behind `messages:` handlers. Point the **existing**
React components at the bus too — a React component can call
`UECA.defaultMessageBus<AppMessage>().unicast(...)` perfectly well.

This is usually the stage that deletes the most code, because it removes the context providers, the
hooks that wrapped them, and the mocking machinery in the tests.

### Stage 4 — screens, one at a time

Convert a screen to `useScreenBase` and render it from your existing router. Keep the old router
until every screen has moved.

### Stage 5 — the shell

Replace the router, layout and providers with `AppRouter`, `AppLayout`, `AppUI` and `Application`.
This is the only stage with a visible cut-over, and by now everything below it is already UECA.

### Stage 6 — delete the scaffolding

The store, the context providers, the effect hooks, the memoisation, the HOCs. If a piece resists
deletion, something above it still owns state on the React side — find it rather than keeping the
piece.

## Mechanical translations

Most of a migration is this table applied repeatedly.

| React | UECA |
| --- | --- |
| `const [x, setX] = useState(0)` | a prop `x: number`, seeded `0`; assign `model.x = 1` |
| `setX(v => v + 1)` | `model.x++` |
| a `props` interface | the `props` section of the struct |
| `props.onChange` | an `events` entry; call it `model.onChange?.(value)` |
| `children` | a `*View` slot prop, or a declared child model |
| `useEffect(fn, [])` | the `constr` hook |
| `useEffect(fn, [])` returning a cleanup | `constr`/`init` plus `deinit`/`unmount` |
| `useEffect(fn, [x])` | `onChangeX` — the synthesised per-prop event |
| `useEffect` that fetches on mount | the `init` hook (it also re-runs when a cached model returns) |
| `useRef` for a mutable non-render value | a `__`-prefixed prop |
| `useRef` for a DOM node | `id={model.htmlId()}`, read it in `draw` |
| `useMemo` / `useCallback` / `React.memo` | delete — models persist and views track their reads |
| `useContext(Ctx)` | a message to the model that owns the value |
| a Redux/Zustand store | props on a service model; selectors become plain reads |
| `dispatch(action)` | a method call on the owning model, or a message |
| a reducer | methods on the model that owns the state |
| React Router `<Route>` | an entry in `appRoutes.tsx` |
| `useNavigate()` | `model.goToRoute(path)` |
| `useParams()` | `model.routeParams` on a `useScreenBase` component |
| prop drilling through three levels | a binding, or a message |
| lifting state up | a binding between the two models |
| a controlled input | a two-way `UECA.bind(() => model.entity, "field")` |
| `react-hook-form` / a schema validator | `useEditBase` + `modelsToValidate` |
| an error boundary component | already there — every View has one |
| a class component | a UECA component; `componentDidMount` → `mount`, `componentWillUnmount` → `unmount` |

## Worked example

```tsx
// Before
function Counter({ start = 0, onLimit }: { start?: number; onLimit?: (v: number) => void }) {
    const [count, setCount] = useState(start);
    useEffect(() => { if (count >= 10) onLimit?.(count); }, [count, onLimit]);
    const bump = useCallback(() => setCount(c => c + 1), []);
    return <button onClick={bump}>{count}</button>;
}
```

```tsx
// After
type CounterStruct = UIBaseStruct<{
    props: { count: number };
    events: { onLimit: (value: number) => void };
}>;

type CounterParams = UIBaseParams<CounterStruct>;
type CounterModel = UIBaseModel<CounterStruct>;

function useCounter(params?: CounterParams): CounterModel {
    const struct: CounterStruct = {
        props: {
            id: useCounter.name,
            count: 0,
        },

        events: {
            // Replaces the effect: no dependency array, and it cannot fire on an unchanged value.
            onChangeCount: (value) => {
                if (value >= 10) model.onLimit?.(value);
            },
        },

        View: () => (
            <button
                id={model.htmlId()}
                onClick={() => model.count++}
            >
                {model.count}
            </button>
        ),
    };

    const model = useUIBase(struct, params);
    return model;
}

const Counter = UECA.getFC(useCounter);
```

The `start` prop disappeared: a caller passes `count={5}`, because a prop *is* the initial value.

## Traps specific to migration

| Symptom | Cause | Fix |
| --- | --- | --- |
| a React component does not re-render from a model it reads | it is not an `observer` | wrap it: `UECA.observe(MyComponent)`, or move the read into a UECA View |
| a migrated component loses state on every parent render | a JSX prop is a **standing declaration**, re-asserted each render | pass a binding for anything the child edits |
| state now exists in two places | ownership straddles the boundary | pick one side; a value is either a model prop or React state, never both |
| `useEffect`-replacement fires when it should not | `onChange<Prop>` only fires on a real change — usually the *old* effect was over-firing | keep the new behaviour; the dependency array was the bug |
| a list resets or duplicates | dynamic children without stable ids | derive each child's `id` from its item |
| a converted hook is called conditionally | hook-created children are cached **positionally** | never call a component hook in a branch or a loop |
| everything is suddenly `T \| undefined` | model props are optional by design | set `strictNullChecks: false` for app code and read defensively |
| a service's message never arrives | its component is not mounted | own it from `Application` so it lives for the app's lifetime |

## Deciding what not to migrate

Some things are better wrapped than converted:

- **A third-party chart, editor or map.** Wrap it in a UECA component whose View renders it and whose
  props feed it. It keeps its own internals; you get a model-shaped interface.
- **A large, stable, self-contained React subtree** with no shared state. Render it from a View and
  leave it. Migrate it when it next needs changing.

What must move: anything holding state other components need, anything talking to the server, and
anything on a route.

## Checking a stage is done

- [ ] The app builds and runs, and the migrated area behaves as before.
- [ ] No state for the migrated area lives on both sides of the boundary.
- [ ] The migrated components extend the narrowest base that fits.
- [ ] Any React component still reading model state is wrapped in `observer`.
- [ ] The context providers / store slices that the stage replaced are deleted, not just unused.
