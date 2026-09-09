# Authoring one component

## The three declarations

For a component `X` you declare exactly five names — the **three-name rule** plus two aliases:

| Name | What it is |
| --- | --- |
| `XStruct` | a `UECA.ComponentStruct<…>` — what the component **declares** |
| `XParams` | `UECA.ComponentParams<XStruct>` — what a **caller** may pass |
| `XModel` | `UECA.ComponentModel<XStruct>` — what the hook **returns** |
| `useX(params?)` | the model hook: builds the struct, calls `UECA.useComponent(struct, params)` |
| `X` | `UECA.getFC(useX)` — usable in JSX |

Export the model type, the hook and the component:

```ts
export { type XModel, useX, X };
```

Add the message type as a second parameter to all three when the component touches the bus:

```ts
type XStruct = UECA.ComponentStruct<{ … }, AppMessage>;
type XParams = UECA.ComponentParams<XStruct, AppMessage>;
type XModel  = UECA.ComponentModel<XStruct, AppMessage>;
```

## Struct sections

Every section is optional. Declare them in this order:

`props` → `children` → `methods` → `events` → `messages` → lifecycle hooks → `View`

| Section | Becomes |
| --- | --- |
| `props` | observable, bindable, event-emitting properties |
| `children` | references to other component models |
| `methods` | read-only functions on the model |
| `events` | assignable, chainable callbacks |
| `messages` | bus subscriptions, keyed by message id |
| `View` | the rendered output |

**Names must be unique across `props`, `children`, `methods` and `events`** — they share one namespace on
the model. A collision throws at construction and names every duplicate it found.

> `useComponent` writes back into the struct literal you passed it. **Never reuse one struct literal for
> two models.** Build it fresh inside the hook, as the template does.

### props

Declare the type in `XStruct`, seed the value in the struct literal:

```ts
props: {
    id: useX.name,      // always first
    caption: "",
    disabled: false,
    items: [],
}
```

A prop value in the struct may also be a **getter** or a `bind(...)` — that makes the prop follow an
external source from the moment the model initialises.

**Two reserved props.** `id` and `cacheable` are system-level, not user properties: they take **plain
values only** — no getter, no `Bond`, in the struct or in params — and no `onChange` / `onChanging` event
is synthesised for them. A bound `cacheable` throws.

**Private props start with `__`.** They are the sanctioned non-reactive slot:

```ts
props: {
    __abortController: undefined,   // plain value: no events, no bindings, no re-render
}
```

A `__` prop is a plain value in every sense — assigning it raises no event and renders nothing, a function
stored in it stays a function, and a `Bond` handed to one throws. Use it for things that must not be
observable: abort controllers, timers, caches, third-party client objects.

**Every model prop is `T | undefined`.** `props: { title: string }` gives `model.title: string | undefined`.
A struct may seed only some props; a bound prop is `undefined` until its binding first runs. Application
code is written on the premise `strictNullChecks: false` — read defensively (`model.items?.length ?? 0`)
rather than narrowing at every line.

### children

```ts
children: {
    firstNameInput: useInput({ label: "First name:", mandatory: true }),
    submitButton:   useButton({ caption: "Save", onClick: () => _save() }),
}
```

The child's `id` is **overwritten with the struct key**, so `firstNameInput` is its path segment.

Values passed here are applied **at startup only** — a constant is an *initial value*, not a standing
declaration. If the child must follow something, pass a binding or a getter:

```ts
children: {
    message: useInput({
        value: () => `Hello ${model.userName}!`,             // read-only, recomputed
        disabled: UECA.bind(() => !model.canEdit, undefined) // read-only
    }),
    nameField: useInput({
        value: UECA.bind(() => model.user, "firstName")      // two-way
    }),
}
```

**Never call a component hook conditionally or in a loop.** Hook-created children are cached by *position*.
A skipped call shifts every later slot. For a data-driven set, render JSX instead — see
`application.md`.

### methods

```ts
methods: {
    reset: () => { model.count = 0; },
    load:  async (id: string) => { model.data = await _fetch(id); },
}
```

Methods are read-only on the model — assigning to one throws. A method whose name **ends in `View`** is
treated as a React component instead; see below.

### events

Events are how a component reports **upward**. Declare the ones that are specific to it; the per-property
ones are synthesised.

```ts
events: {
    onClick: () => void;                       // in XStruct
    onBeforeSave: () => Promise<boolean>;
}
```

```ts
events: {
    onBeforeSave: async () => true,            // an optional default in the struct
    onChangeCount: (value) => { … },           // synthesised — never declared in XStruct
}
```

Call them optionally, always: `model.onClick?.()`.

Only a function or `undefined` may be assigned to an event; anything else throws. Assigning a function to
an **undeclared** name creates an event.

Params-supplied handlers are **chained** with the struct's, not substituted — the struct's runs first. That
is why an inline `init` in JSX can capture a model without disturbing the component's own `init`.

For `onChange<Prop>` / `onChanging<Prop>` / `onPropChange` / `onPropChanging`, see `reactivity.md`.

### messages

```ts
messages: {
    "Api.GetUser": async ({ id }) => await _get(`/users/${id}`),
}
```

Subscription is automatic while the model is mounted. See `application.md`.

### View

```tsx
View: () => (
    <div id={model.htmlId()}>
        <h2>{model.title}</h2>
        <model.firstNameInput.View />
        <model.submitButton.View />
    </div>
)
```

- Render a declared child as `<model.childName.View />`.
- Render another component directly as `<Input id="email" value={…} />`.
- **`id={model.htmlId()}` on the root element**, always.
- Returning `null` is a complete View — it draws nothing and leaves the model fully live, so flipping the
  condition is a re-render, not a remount.
- Type it `UECA.ReactElement` when you need to name the type.
- Any React library may be used inside a View.
- **The first render returns `null`** by design; the model initialises in an effect and the view then
  renders for real. Anything in `View` that assumes initialised state is safe.
- Only the views that actually **read** a property re-render when it changes. No dependency arrays, no
  memoisation. `model.invalidateView()` forces one.

### `*View` slots

Any prop or method whose **name ends in `View`** is treated as a React component and stays reactive. This
is how a component accepts renderable slots:

```tsx
type CardStruct = UECA.ComponentStruct<{
    props: { headerView?: UECA.ReactElement; contentView?: UECA.ReactElement };
    methods: { _FooterView: () => UECA.ReactElement };
}>;

// …
View: () => (
    <div id={model.htmlId()}>
        {model.headerView}
        {model.contentView}
        <model._FooterView />
    </div>
)
```

A `*View` **method** is its own observer: it re-renders on its own when what it reads changes, without the
owner's `View` running. That is what makes it the right place for a list.

## Lifecycle hooks

Seven optional hooks, declared in the struct or passed in params, each receiving the model. **They replace
`useEffect` entirely.**

| Hook | When | Typical use |
| --- | --- | --- |
| `constr(model)` | once, when the model is created | one-time setup: non-reactive state, clients |
| `init(model)` | after `constr`, and **on every cache retrieval** | activation: subscriptions, state reset |
| `draw(model)` | after the view renders (layout effect) | post-render layout work |
| `mount(model)` | when mounted to the DOM | DOM listeners |
| `erase(model)` | before UI removal (layout cleanup) | cancel animations |
| `unmount(model)` | when removed from the DOM | detach DOM listeners |
| `deinit(model)` | when the model is deactivated — e.g. parked in the cache | unsubscribe, release resources |

```
create   constr → init → draw → mount
destroy  erase → unmount → deinit
```

`draw` precedes `mount`: `draw` is a layout effect, `mount` a passive one.

**Rules:**

- **`init` runs again on every cache retrieval; `constr` does not.** Per-activation resets belong in
  `init`; one-time setup belongs in `constr`.
- **`draw` and `erase` must be synchronous.** Returning a `Promise` from either throws.
- The other five are `async`, so a throw surfaces as an unhandled rejection routed to
  `globalSettings.errorHandler` — not at the call site. **No `try/catch` needed; write hooks that cannot
  throw.**
- A hook that throws is reported, never retried. Nothing repairs what it left undone.
- There is deliberately **no `destr()`** — `deinit` is the cleanup point.
- Hooks passed in params are chained after the struct's.

## Extending a component

`useExtendedComponent` builds a **hierarchy**: the derived component inherits the base's props, children,
methods, events and messages, and may add or override any of them. Unlimited depth.

A base component (shared validation, say) takes the extension's struct and params:

```tsx
type BaseStruct = UECA.ComponentStruct<{
    props:   { mandatory: boolean; readOnly: boolean; _validationError?: string };
    methods: { validate: () => Promise<void>; isValid: () => boolean };
    events:  { onValidate: () => Promise<string | undefined> };
}>;

type EditControlStruct<T extends UECA.GeneralComponentStruct> = BaseStruct & UECA.ComponentStruct<T>;
type EditControlParams<T extends BaseStruct = EditControlStruct<{}>> = UECA.ComponentParams<T>;
type EditControlModel<T extends BaseStruct = BaseStruct> = UECA.ComponentModel<T>;

function useEditControl<T extends BaseStruct>(extStruct: T, params?: EditControlParams<T>): EditControlModel<T> {
    const struct: BaseStruct = {
        props:   { mandatory: false, readOnly: false, _validationError: undefined },
        methods: {
            validate: async () => { model._validationError = await model.onValidate?.(); },
            isValid:  () => !model._validationError,
        },
    };

    const model = UECA.useExtendedComponent(struct, extStruct, params);
    return model;
}
```

The extending component declares its own struct against the base's types and calls the base hook instead
of `useComponent`:

```tsx
type InputStruct = EditControlStruct<{
    props:  { label: string; value: string };
    events: { onChange: (value?: string) => void };
}>;

function useInput(params?: EditControlParams<InputStruct>): EditControlModel<InputStruct> {
    const struct: InputStruct = {
        props: { id: useInput.name, label: "", value: "" },
        methods: {
            isValid: () => {
                if (model.disableValidation) return true;
                return model.$.__status.baseResult as boolean;   // the base's answer
            },
        },
        View: () => ( … ),
    };

    const model = useEditControl(struct, params);
    return model;
}
```

**Merge rules:**

| Section | Rule |
| --- | --- |
| `props`, `children`, `methods`, `events`, `messages` | shallow merge — **the extension wins** on a key collision |
| members present in both | **chained** — base first, its result in `model.$.__status.baseResult` |
| `View` | the extension's, if it declares one; otherwise the base's |
| `constr`, `init`, `mount` | base first, then extension |
| `deinit`, `unmount`, `erase` | **extension first**, then base |

A chained call is synchronous if the base returned synchronously, and asynchronous if it returned a
`Promise`. Either half may be absent; the half that exists still runs and reads `baseResult` as
`undefined`.

Render the base's UI inside your own with `BaseView` (the root base) or `BaseViews` (the whole chain, root
first). JSX needs a capitalised binding:

```tsx
View: () => {
    const ParentUI = model.BaseViews[model.BaseViews.length - 1];
    return <div id={model.htmlId()}><ParentUI />{model.caption}</div>;
}
```

**Practice:** put shared logic in the base and keep extensions minimal; set `id: useX.name` in the
*extending* component; read `$.__status.baseResult` rather than trying to call the base directly.

## Specialised factories

When you only need **preset configuration**, do not write a component and do not extend one. Write a hook
that calls the existing hook:

```tsx
type SubmitButtonParams = Omit<ButtonParams, "type" | "kind">;

function useSubmitButton(params?: SubmitButtonParams): ButtonModel {
    return useButton({
        ...params,
        caption: params?.caption || "Submit",   // overridable default
        type: "submit",                         // forced preset
    });
}

const SubmitButton = UECA.getFC(useSubmitButton);
export { useSubmitButton, SubmitButton };
```

The returned model is **identical** to the base's, so variants stay interchangeable. `Omit` the props you
preset so callers cannot fight them; default the ones they may override. Keep factories declarative — if
you need new state or new logic, write a real component or extend one.

| Factory | Extension |
| --- | --- |
| calls an existing hook with preset params | creates a new component type from a base struct |
| returns the base model type | returns a new, extended model type |
| cannot add props, methods or events | can add anything |
| zero overhead | slight overhead |
| **configuration variants** | **behavioural extensions** |
