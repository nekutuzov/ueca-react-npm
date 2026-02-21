# Automatic onChange\<Prop> Events in UECA-React
#events #reactivity #state #onchange

## Description
The automatic `onChange<Prop>` feature in UECA-React simplifies state management by generating event handlers for each property defined in a component's `props` section. These handlers, named in the format `onChange<PropertyName>` (e.g., `onChangeCaption` for a `caption` property), are triggered whenever the corresponding property in the model is modified. This feature leverages UECA’s reactive model and MobX integration to enable components to respond to state changes without requiring manual event handler definitions, enhancing code efficiency and maintainability.

Key aspects of `onChange<Prop>` events:
- **Automatic Generation**: Event handlers are created for every property in `props` without explicit declaration in component structure.
- **Reactive**: Triggered by any change to the property, ensuring real-time updates.
- **Type-Safe**: Fully integrated with TypeScript for robust typing and error prevention.

---

## API/Methods

### Automatic Event Handlers
- **onChange\<PropertyName>**  
  An event handler automatically generated for each property in the `props` section of the component structure. It is triggered when the property’s value changes.  
  - **Signature**: `(newValue: PropType, oldValue: PropType) => void`  
    - `newValue`: The updated value of the property.  
    - `oldValue`: Previous value of the property.  
  - **Usage**: Defined in the `events` section or passed as a prop to child components to react to state changes.

### Triggering Events
- Property changes in the model (e.g., `model.caption = "new value"`) automatically invoke the corresponding `onChange<Prop>` handler if defined.

---

## Code Examples

### Example: Handling Property Changes with onChange
This example shows a component that uses the automatic `onChangeCaption` event to log changes to its `caption` property.

```typescript
import * as UECA from "ueca-react";

type ButtonStruct = UECA.ComponentStruct<{
    props: {
        caption: string
    }
}>;

type ButtonParams = UECA.ComponentParams<ButtonStruct>;
type ButtonModel = UECA.ComponentModel<ButtonStruct>;

function useButton(params?: ButtonParams): ButtonModel {
    const struct: ButtonStruct = {
        props: {
            caption: "Click Me"
        },
        events: {
            // Automatic OnChange event
            onChangeCaption: (newValue, oldValue) => {
                console.log(`Caption changed from "${oldValue}" to "${newValue}"`);
            }
        },
        View: () =>
            <div id={model.htmlId()}>
                <button onClick={() => model.caption = "Updated!"}>
                    {model.caption}
                </button>
            </div>
    };
    const model = UECA.useComponent(struct, params);
    return model;
}

const Button = UECA.getFC(useButton);
export { ButtonModel, useButton, Button };
```

- **Explanation**:  
  - The `caption` property is defined in `props`.  
  - The `onChangeCaption` event handler is automatically available and logs changes.  
  - Clicking the button updates `model.caption` and triggers `onChangeCaption`.

### Example: Two-Way Binding with onChange
This example demonstrates using `onChange<Prop>` in a parent-child scenario with a form input.

```typescript
import * as UECA from "ueca-react";

type FormStruct = UECA.ComponentStruct<{
    props: {
        userName: string
    };
    children: {
        input: InputModel
    };
}>;

type FormParams = UECA.ComponentParams<FormStruct>;
type FormModel = UECA.ComponentModel<FormStruct>;

function useForm(params?: FormParams): FormModel {
    const struct: FormStruct = {
        props: {
            userName: ""
        },
        events: {
            // Automatic OnChange event for "userName" property
            onChangeUserName: (newValue, oldValue) => {
                console.log(`User name changed from "${oldValue}" to "${newValue}"`);
            }
        },
        children: {
            input: useInput({
                value: UECA.bind(() => model, "userName"),
                // Automatic OnChange event for "value" property
                onChangeValue: (newValue, oldValue) => {
                    console.log(`Input value changed from "${oldValue}" to "${newValue}"`);
                }
            })
        },
        View: () =>
            <div id={model.htmlId()}>
                <model.input.View />
            </div>
    };
    const model = UECA.useComponent(struct, params);
    return model;
}

const Form = UECA.getFC(useForm);
export { FormModel, useForm, Form };
```

- **Explanation**:  
  - The parent’s `userName` is bound to the child’s `value` prop.  
  - The child’s input updates the parent’s `userName`, triggering firstly child’s `onChangeValue` and then parent’s `onChangeUserName` to log the changes.

---

## Best Practices
- **Use for Reactive Updates**: Leverage `onChange<Prop>` events to respond to state changes in real-time, such as logging or triggering side effects.
- **Combine with Bindings**: Use `onChange<Prop>` with bidirectional bindings for interactive components like forms to ensure state consistency.
- **Keep Handlers Lightweight**: Avoid heavy computations in `onChange<Prop>` handlers to maintain performance.

## Notes
- `onChange<Prop>` events are automatically declared/generated for all properties in `props`, reducing boilerplate code.
- These events integrate seamlessly with UECA’s MobX-based reactivity system.
- For non-property-based communication, consider the UECA Message Bus.