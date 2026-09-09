# Automatic onChange\<Prop> Events in UECA-React
#events #reactivity #state #onchange

## Description
The automatic `onChange<Prop>` feature in UECA-React simplifies state management by generating event handlers for each property defined in a component's `props` section. These handlers, named in the format `onChange<PropertyName>` (e.g., `onChangeCaption` for a `caption` property), are triggered whenever the corresponding property in the model is modified. This feature leverages UECA’s reactive model and MobX integration to enable components to respond to state changes without requiring manual event handler definitions, enhancing code efficiency and maintainability.

Key aspects of `onChange<Prop>` events:
- **Automatic Generation**: Event handlers are created for every property in `props` (except the system-level `id` and `cacheable`, and `__`-prefixed private props) without explicit declaration in component structure.
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
  - The child’s input updates the parent’s `userName`, and both `onChange` handlers run — the **parent’s `onChangeUserName` first, then the child’s `onChangeValue`**.

---

## Best Practices
- **Use for Reactive Updates**: Leverage `onChange<Prop>` events to respond to state changes in real-time, such as logging or triggering side effects.
- **Combine with Bindings**: Use `onChange<Prop>` with bidirectional bindings for interactive components like forms to ensure state consistency.
- **Keep Handlers Lightweight**: Avoid heavy computations in `onChange<Prop>` handlers to maintain performance.
- **Never Assign the Same Property**: A handler must not write back to the property it was called for — see the note below. Assign a *different* property, or rewrite the value from `onChanging<Prop>` instead.

## Notes
- `onChange<Prop>` events are automatically declared/generated for all properties in `props` except the system-level `id` and `cacheable` and the `__`-prefixed private props, reducing boilerplate code.
- **Across a binding, the handlers run from the source outwards.** A bound property never writes its own value: the assignment is pushed *through* the bond first, and the value comes back from the reaction. So the end that owns the value settles first, and its `onChange<Prop>` runs before the one you assigned. In a chain — parent ⟷ child ⟷ grandchild — the order is the parent's, then the middle one's, then the innermost, **wherever the write started**. The order is the same wherever the write started, which is the point of it: an order that followed the write site would make the same logical change fire handlers differently depending on who touched it first. What it costs is that a level is asked for its opinion after the levels outside it have already committed — so a value a handler rewrites is carried back out to them afterwards rather than being seen by them first (see [Automatic onChanging Events](Automatic%20onChanging%20Events%20in%20UECA-React.md)). Do not write a handler that depends on being called before another component's.
- **A property cannot be assigned from inside its own change handler.** `onChanging<Prop>`, `onChange<Prop>`, `onPropChanging` and `onPropChange` all run while the assignment that triggered them is still in flight, so a nested write to the same property would be overwritten the instant the outer one settles. The model rejects it with a `Re-entrant assignment to property "<name>"` error (`src/componentModelProxy.ts`). Assigning a *different* property is fine and is the supported way to react. To change the value that is being assigned, return the new value from `onChanging<Prop>`. Writing the value that is **already** being assigned is not refused: it discards nothing, and it is what a converging binding does when a derived two-way binding pushes its result back through its own setter.
- An exception thrown by an `onChange<Prop>` handler never reaches the assignment — the dispatcher catches it so a failing handler cannot break the write — but it is reported to `globalSettings.errorHandler`.
- These events integrate seamlessly with UECA’s MobX-based reactivity system.
- For non-property-based communication, consider the UECA Message Bus.