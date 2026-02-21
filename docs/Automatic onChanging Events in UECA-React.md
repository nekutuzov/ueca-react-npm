# Automatic onChanging\<Prop> Events in UECA-React
#events #reactivity #validation #state #onchanging

## Description
The `onChanging<Prop>` event in UECA-React is an automatically generated event that triggers **before** a property's value is updated in a component's state. This pre-update hook allows developers to intercept, validate, or modify the proposed change, offering fine-grained control over state transitions. Unlike the `onChange<Prop>` event, which fires after a property has been updated, `onChanging<Prop>` provides an opportunity to enforce rules or perform side effects before the state is altered.

Key features:
- **Automatic Generation**: Event handlers are created for every property in `props` without explicit declaration in component structure.
- **Preemptive Control**: Runs before the property update, enabling validation or cancellation.
- **Flexible**: Can return a modified value or proceed with the original value that blocks the change.
- **Reactive Integration**: Works seamlessly with UECA-React’s reactive system and MobX.
- **Type-Safe**: Built with TypeScript support for reliable development.

This event is ideal for scenarios like input validation, data transformation, or preventing invalid state changes.

---

## API/Methods

### Event Handler
- **onChanging\<PropertyName>**  
  Automatically generated for each property defined in the `props` section.  
  - **Signature**: `(newValue: PropType, oldValue: PropType) => PropType`  
    - `newValue`: The proposed value for the property.
    - `oldValue`: Current value of the property.  
    - **Return**:  
      - A value to apply.
      - `oldValue` to block the change.  
  - **Usage**: Defined in the `events` section or passed as a prop to child components to react to state changes.

### Triggering the Event
- The event fires whenever a property is modified (e.g., `model.prop = value`), before the change is committed to the state.

---

## Code Examples

### Example 1: Validating Input
This example shows a component that ensures the `quantity` property is between 0 and 10.

```typescript
import * as UECA from "ueca-react";

type CounterStruct = UECA.ComponentStruct<{
    props: {
        quantity: number
    };
}>;

type CounterParams = UECA.ComponentParams<CounterStruct>;
type CounterModel = UECA.ComponentModel<CounterStruct>;

function useCounter(params?: CounterParams): CounterModel {
    const struct: CounterStruct = {
        props: {
            quantity: 0
        },
        events: {
            onChangingQuantity: (newValue, oldValue) => {
                if (newValue < 0 || newValue > 10) {
                    console.error("Quantity cannot be negative or greater than 10");
                    return oldValue; // Prevents the update
                }
                return newValue;
            },
        },
        View: () =>
            <div id={model.htmlId()}>
                <p>Quantity: {model.quantity}</p>
                <button onClick={() => model.quantity++}>
                    {/* Clicking triggers onChangingQuantity event */}
                    Increment Quantity
                </button>
                <button onClick={() => model.quantity--}>
                    {/* Clicking triggers onChangingQuantity event */}
                    Decriment Quantity
                </button>
            </div>
    };
    const model = UECA.useComponent(struct, params);
    return model;
}

const Counter = UECA.getFC(useCounter);
export { CounterModel, useCounter, Counter };
```

- **Explanation**:  
  - The `onChangingQuantity` handler checks if the new value is between 0 and 10.  
  - If it is not, the update is blocked by returning the `oldValue`.  
  - Otherwise, the `newValue` is returned and update the property.

### Example 2: Transforming Input
This example transforms a `text` property to uppercase before applying it.

```typescript
import * as UECA from "ueca-react";

type TextInputStruct = UECA.ComponentStruct<{
    props: {
        text: string
    };
}>;

type TextInputParams = UECA.ComponentParams<TextInputStruct>;
type TextInputModel = UECA.ComponentModel<TextInputStruct>;

function useTextInput(params?: TextInputParams): TextInputModel {
    const struct: TextInputStruct = {
        props: {
            text: ""
        },
        events: {
            onChangingText: (newValue) => {
                return newValue.toUpperCase(); // Transform to uppercase
            }
        },
        View: () =>
            <div id={model.htmlId()}>
                {/* Input value update triggers onChangingText event */}
                <input
                    type="text"
                    value={model.text}
                    onChange={(e) => model.text = e.target.value}
                />
            </div>
    };
    const model = UECA.useComponent(struct, params);
    return model;
}

const TextInput = UECA.getFC(useTextInput);
export { TextInputModel, useTextInput, TextInput };
```

- **Explanation**:  
  - The `onChangingText` handler converts the input to uppercase.  
  - The transformed value is then set as the new `text` property.

---

## Best Practices
- **Validation**: Use `onChanging<Prop>` to enforce constraints (e.g., positive numbers, valid formats).  
- **Lightweight Logic**: Keep handlers fast and simple to avoid performance issues.  
- **Pair with onChange**: Combine with `onChange<Prop>` for pre- and post-update logic.  

---

## Comparison to Traditional React
In traditional React, you might handle validation in an `onChange` handler after the state updates, requiring additional logic to revert invalid changes. With UECA-React’s `onChanging<Prop>`, you can prevent invalid updates proactively, reducing complexity and improving performance.

---

## Notes
- Handlers are optional; if not defined, property updates proceed as normal.  
- The event integrates with UECA’s reactivity, ensuring efficient state management.  
- Returning `oldValue` explicitly cancels the update.