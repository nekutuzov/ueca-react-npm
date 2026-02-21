# Automatic onPropChange and onPropChanging Events in UECA-React
#events #reactivity #state #onpropchange #onpropchanging

## Description
In the UECA-React framework, `onPropChange` and `onPropChanging` are embedded events that automatically fire whenever a property in a component's model changes. Unlike the property-specific `onChange<Prop>` and `onChanging<Prop>` events, these events are designed to handle changes across **all properties** using a single handler. They include an additional `prop` parameter, which specifies the name of the property being modified, enabling centralized logic for multiple properties.

Key features:
- **Automatic Generation**: Event handlers are created without explicit declaration in component structure.
- **Automatic Execution**: Triggered for every property update in the model.
- **Centralized Management**: One event handler can manage all property changes.
- **Pre- and Post-Change Hooks**: `onPropChanging` runs before the update, while `onPropChange` runs after.
- **Flexible Use Cases**: Ideal for validation, logging, or uniform transformations.

These events simplify state management in complex components by reducing the need for multiple property-specific handlers.

---

## API/Methods

### Event Handlers
- **onPropChanging**  
  Fired **before** a property is updated.  
  - **Signature**: `(prop: string, newValue: unknown, oldValue: unknown) => unknown`  
    - `prop`: The name of the changing property.  
    - `newValue`: The proposed new value.  
    - `oldValue`: The current value before the change.  
    - **Return**:  
      - A value to apply.
      - `oldValue` to block the change.      
  - **Purpose**: Validate or transform values before they are set.

- **onPropChange**  
  Fired **after** a property is updated.  
  - **Signature**: `(prop: string, newValue: unknown, oldValue: unknown) => void`  
    - `prop`: The name of the changed property.  
    - `newValue`: The value after the update.  
    - `oldValue`: The value before the update.  
  - **Purpose**: React to changes (e.g., logging or side effects).

### Usage
- Define these events in the `events` section of a UECA-React component structure.
- They are triggered automatically by property assignments (e.g., `model.firstName = "John"`).

---

## Code Example
Here’s an example demonstrating how to use `onPropChanging` for validation and `onPropChange` for logging:

```typescript
import * as UECA from "ueca-react";

type DemoStruct = UECA.ComponentStruct<{
    props: {
        age: number;
        username: string
    };
}>;

type DemoParams = UECA.ComponentParams<DemoStruct>;
type DemoModel = UECA.ComponentModel<DemoStruct>;

function useDemo(params?: DemoParams): DemoModel {
    const struct: DemoStruct = {
        props: {
            id: useDemo.name,
            age: 25,
            username: "user"
        },
        events: {
            onPropChanging: (prop, newValue, oldValue) => {
                console.log(`Attempting to change ${prop} from ${oldValue} to ${newValue}`);
                if (prop === "age" && typeof newValue === "number" && newValue < 0) {
                    return oldValue; // Prevent negative age
                }
                return newValue;
            },
            onPropChange: (prop, newValue, oldValue) => {
                console.log(`${prop} updated from ${oldValue} to ${newValue}`);
            },
        },        
        View: () => (
            <div id={model.htmlId()}>
                <p>Age: {model.age}</p>
                <p>Username: {model.username}</p>
                <button onClick={() => model.age = model.age - 10}>Decrease Age</button>
                <button onClick={() => model.username = "newUser"}>Change Username</button>
            </div>
        ),
    };
    const model = UECA.useComponent(struct, params);
    return model;
}

const Demo = UECA.getFC(useDemo);
export { DemoModel, useDemo, Demo };
```

- **Explanation**:  
  - `onPropChanging` checks if `age` is becoming negative and blocks it by returning `oldValue`.  
  - `onPropChange` logs every successful change for any property.  
  - One handler manages both `age` and `username` updates.

---

## Benefits
- **Reduced Code Duplication**: No need for separate handlers per property.
- **Dynamic Handling**: The `prop` parameter allows conditional logic based on property names.
- **Control**: Modify or block changes with `onPropChanging`.

## Notes
- These events complement, rather than replace, `onChange<Prop>` and `onChanging<Prop>`. Use the latter for property-specific logic.
- Ensure handlers are lightweight to maintain performance, as they execute for every property change.