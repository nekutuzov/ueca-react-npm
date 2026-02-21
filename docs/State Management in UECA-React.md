# State Management in UECA-React
#state #management #basics #api #example #best_practices

## Description
State management is a core aspect of building dynamic applications in UECA-React. Unlike traditional React, which relies heavily on `useState` and `useReducer` for local state management, UECA-React introduces a model-based approach that simplifies state handling and integrates seamlessly with its lifecycle hooks. This article explores how state is managed in UECA-React, provides practical examples, and compares it to traditional React state management techniques.

### Key Concepts
- **Model-Based State**: State is stored in a component's model, making it accessible across lifecycle hooks and methods.
- **Reactive Updates**: Changes to the model automatically trigger UI updates, similar to React's state system.
- **Simplified API**: No need for multiple hooks or complex reducers for basic state management.
- **Model Cache**: Enhanced support for state persistence and caching.

## How State Works in UECA-React

In UECA-React, state is managed through the component's `model`, which is created using the `useComponent` hook. The model contains:
- **Props**: Initial properties passed to the component.
- **State**: Any mutable data defined in the model, such as counters, flags, or computed values.
- **Methods**: Functions that can modify the state.

The model is reactive—any changes to its properties trigger a re-render of the `View` component, ensuring the UI stays in sync with the state.

### Defining State
State is typically defined in the `props` section of the component structure or initialized in the `constr` or `init` lifecycle hooks. For example:
- Define initial state in `props`: `{ count: 0 }`.
- Update state in methods: `model.count++`.

### Updating State
State updates are performed directly on the `model` object. UECA-React detects these changes and re-renders the component automatically. No additional hooks like `setState` are required.

## Comparison to Traditional React

In traditional React, state management often involves:
- **useState**: For simple state updates.
- **useReducer**: For complex state logic.
- **Context**: For global state sharing.

For example, a counter in React might look like this:
```typescript
const [count, setCount] = useState(0);
const increment = () => setCount(count + 1);
```

In UECA-React, the same logic is simpler:
```typescript
props: { count: 0 },
methods: { increment: () => model.count++ },
```

Key differences:
- **No Explicit Setter**: UECA-React modifies state directly on the model.
- **Fewer Hooks**: No need for `useState` or `useReducer` for basic state.
- **Tighter Integration**: State is tied to the model and lifecycle hooks, reducing boilerplate.

## Code Example

Below is an example of a toggle button component that manages a boolean state in UECA-React.

```typescript
import * as UECA from "ueca-react";

// Declare the component structure
type ToggleStruct = UECA.ComponentStruct<{
  props: {
    isOn: boolean 
  };
  methods: {
    toggle: () => void
  };
}>;

// Declare the parameters type
type ToggleParams = UECA.ComponentParams<ToggleStruct>;

// Declare the model type
type ToggleModel = UECA.ComponentModel<ToggleStruct>;

// Custom hook
function useToggle(params?: ToggleParams): ToggleModel {
  const struct: ToggleStruct = {
    props: {
      id: useToggle.name,
      isOn: false
    },
    constr: () => console.log("constr: Toggle model created"),
    init: () => {
      console.log("init: Toggle model initialized");
      model.isOn = false; // Reset state on initialization
    },
    mount: () => console.log("mount: Toggle mounted to DOM"),
    unmount: () => console.log("unmount: Toggle removed from DOM"),
    methods: {
      toggle: () => (model.isOn = !model.isOn),
    },
    View: () => (
      <div id={model.htmlId()}>
        <p>Toggle is {model.isOn ? "ON" : "OFF"}</p>
        <button onClick={model.toggle}>Toggle</button>
      </div>
    ),
  };
  const model = UECA.useComponent(struct, params);
  return model;
}

// Functional component
const Toggle = UECA.getFC(useToggle);

// Export for use in parent components
export { ToggleModel, useToggle, Toggle };
```

In this example:
- The `isOn` state is initialized as `false` in `props`.
- The `toggle` method flips the `isOn` value, triggering a re-render.
- Lifecycle hooks log events for demonstration purposes.

## Best Practices
- **Initialize State in `props`**: Define default state values in the `props` section to make them reactive.
- **Reset State in `init`**: Use the `init` hook to reset state when the component is reactivated from cache.
- **Keep Methods Simple**: State updates in methods should be straightforward to maintain predictability.
- **Avoid Overcomplicating the Model**: For complex state logic, consider breaking it into smaller components or using external stores.
- **Leverage Lifecycle Hooks**: Use hooks like `mount` or `draw` to perform state-dependent actions (e.g., fetching data when mounted).

## Notes
- State in UECA-React is local to the component’s model by default. For global state, consider integrating with root level component (e.g. App) via message bus.
- The reactive system ensures that only changed properties trigger re-renders, optimizing performance.
- State can persist across component mounts when cached, thanks to the `init` and `deinit` hooks.
- Unlike React, there’s no need to memoize state updates, as the model handles reactivity internally.