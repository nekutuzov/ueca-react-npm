# Utility Functions in UECA-React
#utilities #helpers #type_guards #rendering

## Description

Alongside the component model, `ueca-react` exports a small set of helpers. They exist so an application can
be written without importing React or MobX directly, and so the checks the framework makes internally are the
same ones your code makes.

There are four groups:

| Group | Members |
| --- | --- |
| **Rendering** | `IF`, `RenderNode`, `renderNode` |
| **Reactivity** | `observe` |
| **Type guards** | `isUndefined`, `isNull`, `isBoolean`, `isString`, `isNumber`, `isFunction`, `isArray`, `isObject`, `isMap`, `isSymbol`, `isComponentModel` |
| **General** | `isEqual`, `intersection`, `clone`, `sleep`, `errorIf`, `errorIfNot` |

---

## Rendering helpers

### `UECA.IF`

Conditional rendering as a component, so a `View` stays declarative instead of growing a ternary.

```typescript
View: () =>
    <div id={model.htmlId()}>
        <UECA.IF condition={model.isLoggedIn}>
            <span>Welcome back, {model.userName}</span>
        </UECA.IF>
    </div>
```

Renders its children when `condition` is true, and `null` when it is false. Its children go through
`renderNode`, so a component *type* passed as a child is instantiated and made reactive rather than being
rendered as an opaque value.

> `IF` evaluates its children **before** it tests the condition — that is how JSX works, and no component can
> change it. `<UECA.IF condition={!!model.user}><span>{model.user.name}</span></UECA.IF>` builds the inner
> element either way, so the property access still runs. Guard the access as well (`model.user?.name`) when
> the value may be missing.

### `UECA.renderNode` and `UECA.RenderNode`

A slot property can hold three different things: a React element, a component *type*, or a plain value like
a string. `renderNode` normalises all three into something renderable, and wraps a component type in an
observer so it re-renders when the model it reads changes.

```typescript
props: {
    icon: undefined as React.ReactNode | React.ComponentType
},

View: () =>
    <button id={model.htmlId()}>
        {UECA.renderNode(model.icon)}
        {model.caption}
    </button>
```

`RenderNode` is the component form of the same thing, and it takes an optional `render` flag:

```typescript
<UECA.RenderNode node={model.icon} render={!model.compact} />
```

Use `RenderNode` in JSX; use `renderNode` when you need the value inside an expression.

> A property whose **name ends in `View`** is treated as a component automatically and does not need
> `renderNode` — see [Introduction to Components](Introduction%20to%20UECA-React%20Components.md).

### `UECA.observe`

Makes a plain object reactive, or wraps a component in MobX's `observer`. It is the one function in this list
you will reach for regularly, and it is covered in full in
[Arrays and Reactivity](Arrays%20and%20Reactivity%20in%20UECA-React.md).

```typescript
const store = UECA.observe({ theme: "dark", user: undefined });   // a reactive object outside any model
```

---

## Type guards

Ten predicates, each narrowing the type in TypeScript as well as testing at runtime:

```typescript
if (UECA.isString(value)) {
    // value is string here
}
```

`isUndefined`, `isNull`, `isBoolean`, `isString`, `isNumber`, `isFunction`, `isArray`, `isObject`, `isMap`
and `isSymbol` do what their names say. Two points are worth knowing:

- **`isObject` is true for arrays and for `null`-free objects alike.** It tests `typeof value === "object"`
  after excluding `null`, so pair it with `isArray` when the difference matters.
- **`isComponentModel(value)`** answers whether something is a UECA model — it checks for the private
  members bag and for `birthMark`, `fullId` and `htmlId`. Note that it returns a plain `boolean` rather than
  a type predicate, so unlike the ten above it does **not** narrow: cast, or write your own predicate around
  it, if you need the narrowing.

The symbol `UECA.$` and its string form `UECA.$name` are the key under which a model keeps its private
members. They are exported so `isComponentModel` can be reimplemented if you ever need a variant of it; you
should not need them otherwise.

---

## General helpers

### `UECA.isEqual(a, b)`

Structural comparison, one level of recursion per object key.

```typescript
UECA.isEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } });   // true
```

It is the same comparison the model uses to decide whether an assignment actually changed anything, which is
why assigning an equal-looking object fires no `onChange`. Two behaviours to keep in mind:

- **`isEqual(NaN, NaN)` is `false`** — primitives are compared with `===`.
- **Arrays are compared as plain objects**, key by key. There is no length short-circuit and no element-type
  check, so `isEqual([1, 2], [1, 2])` is true but the comparison walks both.

### `UECA.intersection(a, b)`

The elements of `a` that also appear in `b`, as a new array.

```typescript
UECA.intersection(["read", "write", "admin"], model.userRoles);
```

### `UECA.clone(obj)`

A deep copy through `JSON.stringify` / `JSON.parse`.

```typescript
const draft = UECA.clone(model.record);   // edit freely, assign back when the user saves
```

The JSON round trip is the whole story, and its limits are the JSON limits: `Date` becomes a string, `Map`
and `Set` become `{}`, and functions, symbols and `undefined` disappear. Cloning a value that JSON cannot
represent at all — a bare function, `undefined` — returns `undefined` rather than throwing. `0`, `""` and
`false` survive intact.

### `UECA.sleep(ms)`

An awaitable delay, for the places a UI genuinely needs one — a debounce in a method, a pause in a test.

```typescript
methods: {
    save: async () => {
        model.saving = true;
        await UECA.sleep(300);        // let the spinner paint
        await model.bus.unicast("Api.Save", model.record);
        model.saving = false;
    }
}
```

### `UECA.errorIf(condition, message)` and `UECA.errorIfNot(value, message)`

Throw when a precondition fails, in one line instead of four.

```typescript
UECA.errorIf(!model.record.id, "Cannot save a record with no id");

UECA.errorIfNot(model.selected, "No row is selected");
model.selected.delete();              // narrowed: `selected` is not undefined here
```

`errorIfNot` is an **assertion signature**, so TypeScript narrows the value afterwards — you get the guard
and the narrowing from one call. `errorIf` takes a boolean test and does not narrow.

Both throw a plain `Error`. Inside a method or an event handler, that reaches
`globalSettings.errorHandler` like any other failure — see
[Error Handling](Error%20Handling%20in%20UECA-React.md).

---

## Best Practices

- **Prefer these guards to raw `typeof`.** They read better, they narrow, and they are the same checks the
  framework makes, so your code and the model agree about what a value is.
- **Use `IF` for conditional blocks, `?.` for conditional values.** `IF` decides whether an element appears;
  it cannot protect a property access inside its own children.
- **Reach for `clone` only for JSON-shaped data.** For anything holding a `Date`, a `Map` or a function,
  copy it yourself.
- **Do not use `sleep` to wait for state.** Bindings, `onChange<Prop>` and the message bus all deliver a
  value when it is ready; a timed wait that happens to work will stop working under load.
- **`errorIfNot` over a manual `if (!x) throw`** wherever the value is used immediately afterwards — the
  narrowing is the point.

---

## Notes

- Every one of these is a plain function with no dependency on a component model, so they can be used in
  services, stores and tests as freely as in a `View`.
- `renderNode` wraps a component type in `observer` on **every call**, which creates a new component type
  each time. For a slot rendered in a hot path, prefer a `*View` property, whose wrapper is created once.
- `observe` returns MobX's `observer` result for a function, which is a `React.memo` object rather than a
  function — a `typeof` check on the result will surprise you. `isFunction(UECA.observe(MyComponent))` is
  `false`.
