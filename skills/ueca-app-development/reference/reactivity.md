# State, events and bindings

## State is plain assignment

Every declared prop is observable. You mutate it directly:

```ts
model.count++;
model.title = "Ready";
model.items.push(newItem);
```

No `setState`, no action wrapper, no immutable update pattern, no spread-and-reassign. There is **no store
and no reducer** — state is distributed across the component tree, one property at a time.

Where state lives:

| Scope | Holder |
| --- | --- |
| one component | its own props |
| across two components | a `bind()` |
| across the app, decoupled | messages on the bus |
| process-wide configuration | `UECA.globalSettings` |

For genuinely global application state, use a root-level component reached over the bus — not a store.

## Rendering follows reads

Every `View` is an observer, so **only the views that actually read a property re-render when it changes**.
There are no dependency arrays and no memoisation to maintain. `model.invalidateView()` forces a render
when you need one anyway.

A `*View` **method** is its own observer, so it re-renders independently of the owner's `View`.

## What is *not* reactive

| Case | Why |
| --- | --- |
| props whose name starts with `__` | the sanctioned private, non-reactive slot — plain values, no events, no bindings |
| the *contents* of objects inside an array | arrays are shallow — see below |
| anything not declared in `props` | only declared props become observable |
| a module-level `let` | not part of any model. Do not use one for shared state |

## Assigning an equal value does nothing

Assignment short-circuits on structural equality: no events fire and no view re-renders. This is why
`onChange<Prop>` fires **less often** than `onChanging<Prop>` — the latter runs on every attempt, the
former only when the value actually changed.

## Arrays are shallowly reactive

The array's **structure** is reactive; the contents of the objects inside it are not.

| Operation | Updates the UI? |
| --- | --- |
| `model.tasks.push(item)`, `pop`, `splice`, `model.tasks[0] = item` | ✅ structural |
| `model.tasks = newArray` | ✅ replacement |
| `model.tasks[0].done = true` | ❌ the item object is not observable |

Fix it by wrapping items with `UECA.observe()` **at insertion time**:

```ts
model.tasks.push(UECA.observe({ id: 3, text: "Write docs", done: false }));
model.tasks[0].done = true;               // now this DOES update the UI

model.tasks = raw.map(UECA.observe);      // for a bulk load from an API
```

`observe()` makes a plain object observable without importing MobX. Applied to a component, it wraps it in
`observer`.

> A plain **object** assigned directly to a prop is a different case: it becomes deeply observable
> automatically. The shallow rule bites for objects *inside an array*.

## Automatic property events

For **every** declared prop — except `id`, `cacheable` and the `__` private ones — four events exist
without being declared. They are typed, and available on the struct and in params alike.

| Event | Signature | Fires | May rewrite? |
| --- | --- | --- | --- |
| `onChanging<Prop>` | `(newValue, oldValue) => newValue` | **before** the write | ✅ return a value to apply, or `oldValue` to reject |
| `onChange<Prop>` | `(newValue, oldValue) => void` | **after** the value settles | ❌ |
| `onPropChanging` | `(prop, newValue, oldValue) => unknown` | before, for every prop | ✅ |
| `onPropChange` | `(prop, newValue, oldValue) => void` | after, for every prop | ❌ |

For a prop `caption` the names are `onChangingCaption` and `onChangeCaption` — first letter capitalised.

```ts
events: {
    // transform on the way in
    onChangingCode: (value) => value?.toUpperCase(),

    // reject a value
    onChangingAge: (value, oldValue) => (value >= 0 ? value : oldValue),

    // react to a settled change
    onChangeSelectedId: (value) => { void _loadDetails(value); },
}
```

**`onChanging*` handlers must be synchronous.** Returning a `Promise` throws. Do async work from
`onChange*`, or from a method.

**A throwing `onChange*` is swallowed** — it never propagates back to the assignment. It is reported to
`globalSettings.errorHandler`, so it is not lost, but do not rely on a `try/catch` around the assignment
to see it.

### Dispatch order

Four "changing" slots fire in this exact order, each able to rewrite the value:

```
struct.onPropChanging → struct.onChanging<Prop> → params.onPropChanging → params.onChanging<Prop>
```

The "changed" slots fire in the mirrored order afterwards.

### A handler may not re-assign its own property

All four slots run while the assignment is still in flight, so a nested write carrying a **different**
value would be discarded. That throws:

> Re-entrant assignment to property "value" … The property is already being assigned a different value,
> so this one would be discarded.

To change the value being assigned, **return it from `onChanging<Prop>`**. Assigning a *different*
property from a handler is fine and is the supported way to react. Writing the same value already in
flight is a permitted no-op.

### Silent bulk updates

```ts
model.disableOnChange();
try {
    model.a = 1;
    model.b = 2;
} finally {
    model.enableOnChange();      // an unmatched call throws
}
```

## Bindings

A binding links one component's property to a value owned somewhere else. It is the only way to share
state between two models without going through the bus. **Bindings are passed in params or seeded in the
struct — never assigned as a value.** Assigning a `Bond` to a property throws.

### The four forms

| Written as | Produces |
| --- | --- |
| `UECA.bind(() => model.user, "firstName")` | **two-way** on that object property |
| `UECA.bind(() => format(model.phone), (v) => { model.phone = strip(v) })` | **two-way**, custom |
| `UECA.bind(() => model.total, undefined)` | **read-only** |
| `() => model.total` — a bare arrow function as a prop value | **read-only**, converted automatically |

The first argument is **always a function**. `bind(model.user, "firstName")` throws
`Invalid arguments for bind()`.

```tsx
<Input value={UECA.bind(() => model.user, "firstName")} />       {/* two-way */}
<Input readOnly={() => !model.canEdit} />                        {/* read-only */}
<Button disabled={UECA.bind(() => !model.isValid(), undefined)}/>{/* read-only */}
```

A throwing getter or setter is logged rather than propagated.

### Rules

- **A param's kind is fixed when the model initialises.** A param that arrived as a binding must stay one;
  it may not become a value, be dropped, or appear later. Both directions throw during the render that
  does it. To vary what a binding reads, put the condition **inside the getter**:

  ```tsx
  {/* wrong — the prop switches kind */}
  <Input
      value={editing ? UECA.bind(() => model.draft, "name") : model.saved.name}
  />

  {/* right — one binding, the condition inside it */}
  <Input
      value={UECA.bind(
          () => editing ? model.draft.name : model.saved.name,
          (v) => { if (editing) model.draft.name = v; }
      )}
  />
  ```

  A **new `Bond` object each render is not a kind change** — JSX rebuilds `bind(...)` every render and that
  is expected. A bare getter counts as the same kind as `bind(getter, undefined)`.

- **`cacheable` may not be bound**, in the struct or in params. Both throw.
- **The struct binding wins** when a property carries one from the struct and one from params.
- A binding on a prop passed through JSX is **never reassigned** by a parent re-render, which is why an
  edited bound field survives one.

### Arrays across a binding

Both ends hold the **same array object**, so `push` / `splice` / an index write at either end is seen at
the other. Two consequences:

- **The source must be observable.** A model property always is. A plain object is not — wrap it in
  `UECA.observe()`, or the ends stay on separate arrays where only replacement propagates.
- **A read-only bond shares the array too.** It governs the *reference*: replacing the array is refused,
  but an in-place mutation still reaches the source. Return `.slice()` from the getter if that matters.

### Re-convergence has a budget

When an `onChanging<Prop>` handler **reverts** a value, the property is out of step with whatever is bound
to it, so the bindings recalculate until something gives. `globalSettings.bindingRetries` (default 10)
bounds the rounds; exceeding it is reported to `globalSettings.errorHandler`:

> Property "value" … did not settle after 10 binding rounds. A changing handler keeps rejecting the value
> its binding keeps delivering …

The budget belongs to the cascade, not to the assignment — a fresh write from application code starts it
again. On an **unbound** property, refusing keystroke after keystroke is ordinary and costs nothing. On a
**read-write bound** property each refusal is a real divergence, because the setter writes through the
bond before the handler sees the value. **Reject the value at the source as well**, and the two stay in
step.
