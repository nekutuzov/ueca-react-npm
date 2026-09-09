# Specialized Component Factories in UECA-React

## Overview

Specialized Component Factories is a powerful pattern in UECA-React that allows you to create pre-configured variants of existing components by wrapping their hooks with preset properties. This pattern maintains full UECA compliance while providing convenient shortcuts for commonly-used component configurations.

## The Pattern

A specialized factory is a custom hook that calls an existing component hook with pre-configured parameters, returning a model of the same type. This eliminates code duplication and provides type-safe convenience components.

### Basic Structure

```tsx
// Base component
function useBaseComponent(params?: BaseComponentParams): BaseComponentModel {
    const struct: BaseComponentStruct = {
        props: { /* ... */ },
        View: () => <div>...</div>
    };
    const model = useUIBase(struct, params);
    return model;
}

// Specialized factory
type SpecializedParams = Omit<BaseComponentParams, "presetProp">;

function useSpecializedComponent(params?: SpecializedParams): BaseComponentModel {
    return useBaseComponent({
        ...params,
        presetProp: "preset-value"
    });
}

const SpecializedComponent = UECA.getFC(useSpecializedComponent);
```

## Real-World Example: CloseIconButton

One of the most practical applications of this pattern is the `CloseIconButton` - a specialized variant of `IconButton` with a pre-configured close icon.

```tsx
// Base IconButton component
type IconButtonStruct = UIBaseStruct<{
    props: {
        color: Palette | "inherit";
        disabled: boolean;
        iconView: React.ReactNode;
        size: "small" | "medium" | "large";
    };
    events: {
        onClick: (source: IconButtonModel) => UECA.MaybePromise;
    };
}>;

function useIconButton(params?: IconButtonParams): IconButtonModel {
    const struct: IconButtonStruct = {
        props: {
            id: useIconButton.name,
            color: "inherit",
            disabled: false,
            iconView: undefined,
            size: "medium",
        },
        methods: {
            click: () => {
                if (!model.disabled && model.onClick) {
                    asyncSafe(() => model.onClick(model));
                }
            }
        },
        View: () => (
            <button
                id={model.htmlId()}
                className={`ueca-icon-button ueca-icon-button-${model.size}`}
                disabled={model.disabled}
                onClick={model.click}
            >
                {model.iconView}
            </button>
        )
    };
    const model = useUIBase(struct, params);
    return model;
}

// Specialized CloseIconButton factory
type CloseIconButtonParams = Omit<IconButtonParams, "iconView">;

function useCloseIconButton(params?: CloseIconButtonParams): IconButtonModel {
    return useIconButton({
        ...params,
        iconView: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
        )
    });
}

const CloseIconButton = UECA.getFC(useCloseIconButton);

export { 
    IconButtonModel, IconButtonParams, useIconButton, IconButton,
    useCloseIconButton, CloseIconButton 
};
```

### Usage

```tsx
// Instead of writing this every time:
<IconButton
    iconView={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
    }
    onClick={() => model.close()}
/>

// You can write:
<CloseIconButton onClick={() => model.close()} />
```

## Key Benefits

### 1. **Type Safety**
Using `Omit` prevents users from accidentally overriding the preset properties:
```tsx
type CloseIconButtonParams = Omit<IconButtonParams, "iconView">;
```

### 2. **Zero Overhead**
No wrapper components, no extra layers - just a convenient way to call the base hook with preset values. The returned model is identical to what the base hook returns.

### 3. **Full UECA Compliance**
As long as the factory hook returns a valid UECA model with the proper structure (props, children, methods, events, View), the framework handles it perfectly.

### 4. **DRY Principle**
All logic stays in the base component. The factory is purely declarative configuration.

### 5. **Composability**
You can create multiple specialized variants that all return the same model type, allowing them to be used interchangeably.

## More Examples

### Submit and Cancel Buttons

```tsx
type SubmitButtonParams = Omit<ButtonParams, "type" | "variant" | "color">;

function useSubmitButton(params?: SubmitButtonParams): ButtonModel {
    return useButton({
        ...params,
        type: "submit",
        variant: "contained",
        color: "primary.main",
        contentView: params?.contentView || "Submit"
    });
}

type CancelButtonParams = Omit<ButtonParams, "variant" | "color">;

function useCancelButton(params?: CancelButtonParams): ButtonModel {
    return useButton({
        ...params,
        variant: "outlined",
        color: "text.secondary",
        contentView: params?.contentView || "Cancel"
    });
}
```

### Specialized Alerts

```tsx
function useSuccessAlert(params?: Omit<AlertParams, "severity">): AlertModel {
    return useAlert({
        ...params,
        severity: "success"
    });
}

function useErrorAlert(params?: Omit<AlertParams, "severity">): AlertModel {
    return useAlert({
        ...params,
        severity: "error"
    });
}
```

### Icon Buttons with Common Icons

```tsx
function useMenuIconButton(params?: Omit<IconButtonParams, "iconView">): IconButtonModel {
    return useIconButton({
        ...params,
        iconView: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
        )
    });
}

function useDeleteIconButton(params?: Omit<IconButtonParams, "iconView">): IconButtonModel {
    return useIconButton({
        ...params,
        iconView: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
        )
    });
}
```

## Best Practices

### 1. Use `Omit` for Preset Properties
Always remove preset properties from the params type to prevent conflicts:
```tsx
type SpecializedParams = Omit<BaseParams, "presetProp1" | "presetProp2">;
```

### 2. Allow Override for Non-Critical Props
For properties like `contentView` in buttons, you can provide defaults while still allowing overrides:
```tsx
function useSubmitButton(params?: SubmitButtonParams): ButtonModel {
    return useButton({
        ...params,
        contentView: params?.contentView || "Submit",  // Default but overridable
        type: "submit"  // Always preset, not overridable
    });
}
```

### 3. Export Both Hook and Component
Follow the standard UECA pattern:
```tsx
const SpecializedComponent = UECA.getFC(useSpecializedComponent);
export { useSpecializedComponent, SpecializedComponent };
```

### 4. Keep Factories Simple
Specialized factories should only preset configuration - avoid adding new logic or state. Complex behavior should be handled by creating a new full component.

### 5. Document the Preset Values
Make it clear what properties are preset and cannot be overridden:
```tsx
/**
 * IconButton pre-configured with a close (X) icon.
 * The iconView property is preset and cannot be overridden.
 */
function useCloseIconButton(params?: CloseIconButtonParams): IconButtonModel {
    // ...
}
```

## When to Use This Pattern

### ✅ Good Use Cases
- Common icon button variants (close, menu, delete, etc.)
- Form buttons with standard styling (submit, cancel, save)
- Alert/notification variants with preset severity
- Text fields with specific input types (email, password, phone)
- Dialog variants with preset configurations

### ❌ When Not to Use
- When the component needs additional state or logic
- When you need to modify the component's behavior, not just configuration
- When the preset is only used once or twice in the application
- When the factory would need to preset too many properties (create a full component instead)

## Relationship with Component Extension

This pattern differs from Component Extension (using `useXXX` with base struct):

| Specialized Factory | Component Extension |
|---------------------|---------------------|
| Calls existing hook with preset params | Creates new component extending base struct |
| Returns base model type | Returns new, extended model type |
| Zero overhead | Slight overhead for extension |
| Cannot add new props/methods | Can add new props, methods, events |
| Best for configuration variants | Best for behavioral extensions |

## Conclusion

Specialized Component Factories provide a UECA-compliant way to create convenient, type-safe variants of existing components. By leveraging TypeScript's `Omit` utility type and the spread operator, you can eliminate boilerplate code while maintaining full framework compatibility.

This pattern is particularly valuable for UI component libraries where many variations of a base component are needed, but each variation is just a configuration difference rather than a behavioral difference.

Remember: If your hook returns a valid UECA model, the framework will handle it correctly - giving you flexibility to create elegant abstractions that suit your application's needs.
