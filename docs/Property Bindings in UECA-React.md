# Property Bindings in UECA-React
#bindings #props #state #reactivity

## Description
Property bindings in UECA-React are crucial for managing state and component interactions. They are passed to the component model hook via parameters, establishing efficient data flow and synchronization, ensuring seamless propagation of state changes across components. UECA-React supports three primary types of bindings:

- **Unidirectional Binding**: Synchronizes target property with the source value, ideal for one-way data flow.
- **Bidirectional Binding**: Synchronizes state between two properties, allowing updates in both directions.
- **Custom Binding**: Offers flexibility to transform values during binding, accommodating complex use cases.

These bindings are:
- **Reactive**: Automatically update dependent components when bound properties change.
- **Type-Safe**: Built with TypeScript for reliable and error-free data binding.
- **Flexible**: Support a wide range of scenarios, from simple displays to advanced state transformations.

---

## API/Methods

### Custom Binding
- **UECA.bind(getter, setter)**  
  Returns a binding object with user-defined getter and setter functions for transforming values.
  - **Parameters**:  
    - `getter`: A function without parameters that returns the source value for target component's property synchronization.  
    - `setter`: A function with one parameter (new value) that updates the source value.
  - **Returns**: A binding object for use in a target component's property synchronization.

### Bidirectional Binding
- **UECA.bind(sourceObject, propName)**  
  A simplified version of Custom Binding. Creates a bidirectional binding that synchronizes state between two properties, allowing changes to propagate in both directions.
  - **Parameters**:  
    - `sourceObject`: The object containing the source property.  
    - `propName`: The name of the source object property to bind.
  - **Returns**: A binding object for use in a target component's property synchronization.    

### Unidirectional Binding
- **Arrow function returning value**
  A shorthand for Custom Binding with a defined getter but an undefined setter. A function without parameters that returns the source value for target component's property synchronization.
  - **Returns**: A value for use in target component's property synchronization.

---

## Code Examples

### Unidirectional and Bidirectional Bindings

This example demonstrates input components that both read and update the form's userName property. Additionally, the form can be configured to operate in read-only mode.

```typescript
// Parent component (Edit Form)
type EditFormStruct = UECA.ComponentStruct<{
    props: {
        readOnly: boolean,
        userName: {
            firstName?: string;
            lastName?: string
        }
    };
    children: {
        firstNameInput: InputModel,
        lastNameInput: InputModel
    };
}>;

type EditFormParams = UECA.ComponentParams<EditFormStruct>;
type EditFormModel = UECA.ComponentModel<EditFormStruct>;

function useEditForm(params?: EditFormParams): EditFormModel {
    const struct: EditFormStruct = {
        props: {
            readOnly: false,
            userName: {}
        },
        children: {
            firstNameInput: useInput({
                readOnly: () => model.readOnly, // Unidirectional binding
                value: UECA.bind(() => model.userName, "firstName"), // Bidirectional binding
            }),

            lastNameInput: useInput({
                readOnly: () => model.readOnly, // Unidirectional binding
                value: UECA.bind(() => model.userName, "lastName"), // Bidirectional binding
            })
        },
        View: () =>
            <div id={model.htmlId()}>
                <model.firstNameInput.View />
                <model.lastNameInput.View />
            </div>
    };
    const model = UECA.useComponent(struct, params);
    return model;
}

// Child Component (Input)
type InputStruct = UECA.ComponentStruct<{
    props: {
        readOnly: boolean
        value: string
    };
}>;

type InputParams = UECA.ComponentParams<InputStruct>;
type InputModel = UECA.ComponentModel<InputStruct>;

function useInput(params?: InputParams): InputModel {
    const struct: InputStruct = {
        props: {
            readOnly: false,
            value: ""
        },
        View: () =>
            <div id={model.htmlId()}>
                <input
                    type="text"
                    readOnly={model.readOnly}
                    value={model.value}
                    onChange={(e) => model.value = e.target.value}
                />
            </div>
    };
    const model = UECA.useComponent(struct, params);
    return model;
}
```

- **Explanation**:  
  The parent binds `userName.firstName` and `userName.lastName` to the children's `value` property. Changes in the inputs update the form’s state, keeping everything in sync. The form's `readOnly` property unidirectionally propagates to the `readOnly` properties of the inputs.

### Custom Binding
This example formats a phone number for display while storing it as digits only.

```typescript
type ContactFormStruct = UECA.ComponentStruct<{
    props: {
        phoneNumber: string
    };
    children: {
        phoneInput: InputModel
    };
}>;

type ContactFormParams = UECA.ComponentParams<ContactFormStruct>;
type ContactFormModel = UECA.ComponentModel<ContactFormStruct>;

function useContactForm(params?: ContactFormParams): ContactFormModel {
    const struct: ContactFormStruct = {
        props: {
            phoneNumber: ""
        },
        children: {
            phoneInput: useInput({
                value: UECA.bind(
                    () => _formatPhoneNumber(model.phoneNumber),  // Getter: format for display
                    (value) => (model.phoneNumber = value.replace(/\D/g, ''))  // Setter: store only digits
                )
            })
        },
        View: () =>
            <div id={model.htmlId()}>
                <model.phoneInput.View />
            </div>
    };
    const model = UECA.useComponent(struct, params);
    return model;

    // Private methods
    function _formatPhoneNumber(phoneNumber: string): string {
        const cleaned = ('' + phoneNumber).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phoneNumber;
    }
}
```
- **Explanation**:  
  The getter formats the phone number for display (e.g., `(123) 456-7890`), while the setter stores it as digits (e.g., `1234567890`), ensuring a clean model state.

---

## Best Practices
- **Unidirectional Binding**: Use for read-only data display to maintain simplicity and predictability.
- **Bidirectional Binding**: Apply to interactive elements like forms where child components need to update the parent.
- **Custom Binding**: Leverage for formatting or transforming data between the model and UI, keeping logic clear and concise.
- **Minimize Complexity**: Keep binding logic straightforward to optimize performance and maintainability.

---

## Notes
- Bindings are fully reactive, ensuring real-time updates across components.
- They support all data types, including primitives, objects, and arrays.
- For interactions beyond parent-child relationships, explore the UECA Message Bus.