# Component IDs in UECA-React

In UECA-React, every component has a built-in `id` property to uniquely identify it within the application. This system ensures clear tracking and seamless integration with the DOM, making debugging and testing easier.

## Setting the Component ID

The `id` property is initialized in the component's hook using the hook's name. This standard pattern provides a consistent starting point for identification.

```typescript
import * as React from "react";
import * as UEC from "ueca-react";

type ButtonStruct = UEC.ComponentStruct<{
    props: {
        id: string;
        caption: string;
    };
    events: {
        onClick: () => void;
    };
}>;

type ButtonParams = UEC.ComponentParams<ButtonStruct>;
type ButtonModel = UEC.ComponentModel<ButtonStruct>;

function useButton(params?: ButtonParams): ButtonModel {
    const struct: ButtonStruct = {
        props: {
            id: useButton.name, // Sets initial id to "button"
            caption: ""
        },
        View: () => (
            <div id={model.htmlId()}>
                <button onClick={() => model.onClick?.()}>
                    {model.caption}
                </button>
            </div>
        )
    };
    const model = UEC.useComponent(struct, params);
    return model;
}

const Button = UEC.getFC(useButton);
export { ButtonModel, useButton, Button };
```

**Why use `useButton.name`?** It assigns a default `id` based on the hook's name, ensuring each component type is distinguishable from the start.

## Using `model.htmlId()` in the View

The `model.htmlId()` method generates a unique HTML `id` attribute for the component’s top-level JSX element, typically a `<div>`. This links the component to its DOM representation.

**Rule**: Always apply `id={model.htmlId()}` to the first JSX element in the `View`.

```typescript
View: () => (
    <div id={model.htmlId()}>
        <button>{model.caption}</button>
    </div>
)
```

This ensures proper rendering and allows UECA to track the component in the DOM.

## Understanding `model.fullId()`

The `model.fullId()` method returns the component’s full path in the parent-child hierarchy, combining `id` values from all parent components. For example, a button inside a form might have:

```typescript
model.fullId() // Returns "app.ui.mainForm.button"
```

This path is useful for debugging, as it shows exactly where the component sits in your app’s structure.

## Benefits for Developers

- **Unique Identification**: The `id` property makes every component traceable, simplifying logic and interactions.
- **DOM Integration**: `model.htmlId()` ensures each component has a unique HTML `id`, aiding styling and testing (e.g., with tools like UI Vision).
- **Debugging Clarity**: `model.fullId()` pinpoints a component’s place in the hierarchy, making it easier to diagnose issues.

## Best Practices

1. **Always set `id`**: Use `id: <hook_name>.name` in every component’s `struct.props`.
2. **Apply `htmlId()`**: Assign `id={model.htmlId()}` to the top-level JSX element in `View`.
3. **Use `fullId()` for debugging**: Check `model.fullId()` in logs or console to understand component relationships.

By following these patterns, you’ll keep your UECA components organized and easy to work with.
