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
- **UECA.bind(sourceObjectGetter, propName)**  
  A simplified version of Custom Binding. Creates a bidirectional binding that synchronizes state between two properties, allowing changes to propagate in both directions.
  - **Parameters**:  
    - `sourceObjectGetter`: A function without parameters returning the object that owns the source property — `() => model.userName`, not `model.userName`. It is called on every read and every write, so the binding keeps working when the object it reaches through is replaced, and tolerates it being `undefined` (the access is reported and yields `undefined` instead of throwing).  
    - `propName`: The name of the source object property to bind.
  - **Returns**: A binding object for use in a target component's property synchronization.    

### Unidirectional Binding
- **Arrow function returning value**
  A shorthand for Custom Binding with a defined getter but an undefined setter. A function without parameters that returns the source value for target component's property synchronization.
  - **Returns**: A value for use in target component's property synchronization.
  - **With an array, read-only governs the reference, not the contents.** The bound property and its source hold one array, so `model.items.push(...)` reaches the source even though the binding has no setter — what is refused is replacing the array (`model.items = [...]`, which snaps back to the source). This is `const` in JavaScript, not a frozen array. If the source must not change, hand out a copy from the getter: `() => model.items.slice()`.

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
- **Put Conditions Inside the Binding**: A parameter is bound or it is not, and that is decided once. Never swap a binding for a value between renders — write the condition into the binding's own getter (a Custom Binding) instead.

---

## Notes
- Bindings are fully reactive, ensuring real-time updates across components.
- They support all data types, including primitives, objects, and arrays.
- **An array crosses a binding by identity, and the source must be observable.** Both ends hold the *same* array, so `push`, `splice` and an index assignment on either end are seen by the other — there is no copy to fall out of step. This works only while the source array is observable, which a model property always is. Bind to a plain object — a module-level store, a service field — and the two ends stay on separate arrays: replacing the array still propagates, but mutating it in place does not, in either direction. Wrap such a source in `UECA.observe()` and the sharing comes back. See [Arrays and Reactivity](Arrays%20and%20Reactivity%20in%20UECA-React.md).
- **A parameter's kind is fixed when the model is created.** The reactions that keep a bound property in sync are armed once, from the parameters in hand at that moment. A parameter that is a binding must stay a binding for the life of the model; it may not be replaced by a value, dropped, or introduced later. Doing so throws `Parameter "<name>" … changed from a binding to a value`, during the render that did it. A bare getter function counts as a binding — the framework turns it into a read-only one — and JSX rebuilding the `bind()` call on every render is normal: what is fixed is the kind, not the `Bond` object.
- **A property can carry two bindings at once, and the struct one has the final say.** A component may declare a binding for a property in its own `struct` — a sensible default, or a link to something it owns — while a caller passes another for the same property. Both stay live. When the component itself is written to, the value goes through the struct binding first and then the params binding. When the *caller's* source changes, the params reaction writes the new value through the struct binding and reads it back, so a struct binding that transforms values gets to transform this one too. The exception is the very first convergence, while the reactions are being armed: the params reaction fires last, so the caller's initial value is what both ends settle on. If that surprises you, it is a sign the two bindings disagree about who owns the value — which is usually worth resolving rather than relying on.
- For interactions beyond parent-child relationships, explore the UECA Message Bus.