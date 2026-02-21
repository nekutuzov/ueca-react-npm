# Introduction to UECA-React Components
#components #basics #api #example #best_practices

## Description
UECA-React (Unified Encapsulated Component Architecture) provides a structured approach to building React applications by encapsulating component logic, state, and UI within a consistent template. Components in UECA-React are defined using a custom hook that creates a reactive model, leveraging MobX for state management. This article introduces the anatomy of a UECA component, explaining how to create and use components based on the standard template. All sections of the template are optional, allowing flexibility while maintaining uniformity.

UECA components offer:
- **Modularity**: Clear separation of concerns within a single structure.
- **Type Safety**: Full TypeScript support for robust development.
- **Reactivity**: Automatic UI updates via MobX integration.
- **Decoupled Logic**: Support for lifecycle hooks, events, and messaging.

## Component Template

The standard UECA component template consists of a TypeScript structure, a custom hook, and a functional component. Below is a breakdown of the template’s key elements.

### Structure Declaration
The component structure is defined using a TypeScript interface, specifying optional sections:
- **props**: Properties for state and configuration.
- **events**: Event handlers for component interactions.
- **children**: Nested UECA component models.
- **methods**: Functions available on the model.

```typescript
type MyCompStruct = UECA.ComponentStruct<{
  props: { /* properties */ };
  events: { /* event handlers */ };
  children: { /* child components */ };
  methods: { /* methods */ };
}>;
```

### Properties and methods derived from UECA.ComponentStruct
- **props**: `id: string`, `cacheable: boolean`, `bus: MessageBus`
- **methods**: `disableOnChange()`, `enableOnChange()`, `changeNotifyDisabled(): boolean`, `fullId(): string`, `htmlId(): string`, `birthMark(): string`, `clearModelCache()`, `getChildrenModels(): AnyComponentModel[]`, `invalidateView()`


### Type Definitions
- **Parameters**: `UECA.ComponentParams<MyCompStruct>` defines the input parameters (props, events, hooks).
- **Model**: `UECA.ComponentModel<MyCompStruct>` defines the component’s reactive model.

```typescript
type MyCompParams = UECA.ComponentParams<MyCompStruct>;
type MyCompModel = UECA.ComponentModel<MyCompStruct>;
```

### Custom Hook
The custom hook (`useMyComp`) creates the component model using `UECA.useComponent`. It initializes the structure with optional sections:
- **props**: Initial state or configuration.
- **children**: Child component models.
- **methods**: Model methods.
- **events**: Event handlers.
- **messages**: Message bus handlers for listenning messages (for inter-component communication).
- **Lifecycle Hooks**: `constr`, `init`, `deinit`, `mount`, `unmount`, `draw`, `erase`.
- **View**: The component’s UI, returned as JSX.

```typescript
function useMyComp(params?: MyCompParams): MyCompModel {
  const struct: MyCompStruct = {
    View: () => <div>Hello World!</div>, // UI (otional)
    // Include only needed sections and hooks
  };
  const model = UECA.useComponent(struct, params);
  return model; // members of struct sections (props, events, methods and children) are accessible directly from model (e.g. model.id). 
}
```

### Functional Component
The functional component is generated using `UECA.getFC` to wrap the custom hook.

```typescript
const MyComp = UECA.getFC(useMyComp);
```

### Exports
Export the model type, hook, and component for use in parent components.

```typescript
export { MyCompModel, useMyComp, MyComp };
```

## API/Methods
- **UECA.useComponent(struct, params)**: Creates or retrieves a reactive component model.
  - **Example**: `const model = UECA.useComponent(struct, params);`
- **UECA.getFC(hook)**: Converts a custom hook into a React functional component.
  - **Example**: `const MyComp = UECA.getFC(useMyComp);`

## Code Example
### Simple Counter Component
This example creates a `Counter` component with a single state property (`count`) and a method to increment it.

```typescript
import * as UECA from "ueca-react";

// Declare the component structure
type CounterStruct = UECA.ComponentStruct<{
  props: {
    count: number
  };
  methods: { 
    increment: () => void 
  };
}>;

// Declare the parameters type
type CounterParams = UECA.ComponentParams<CounterStruct>;

// Declare the model type
type CounterModel = UECA.ComponentModel<CounterStruct>;

// Custom hook
function useCounter(params?: CounterParams): CounterModel {
  const struct: CounterStruct = {
    props: {
      id: useCounter.name, // Initial ID set to the hook name for tracing log
      count: 0 // Initial state
    }, 
    methods: {
      increment: () => {
        model.count++; // Update state
      }
    },
    View: () => (
      <div id={model.htmlId()}> {/* DOM element ID */}
        <p>Count: {model.count}</p>
        <button onClick={model.increment}>Increment</button>
      </div>
    )
  };
  const model = UECA.useComponent(struct, params);
  return model;
}

// Functional component
const Counter = UECA.getFC(useCounter);

// Export for use in parent components
export { CounterModel, useCounter, Counter };
```

### Using the Counter in a Parent Component
This shows how to integrate the `Counter` component into a parent.

```typescript
import * as UECA from "ueca-react";
import { useCounter, CounterModel } from "./Counter";

type AppStruct = UECA.ComponentStruct<{
  children: {
    counter: CounterModel
  };
}>;

function useApp(): UECA.ComponentModel<AppStruct> {
  const struct: AppStruct = {
    props: {
      id: "App", // ID of the application container      
    }, 
    children: {
      counter: useCounter({ count: 10 }) // Initialize Counter and set the count property to 10
    },
    View: () => (
      <div id={model.htmlId()}>
        <h1>My App</h1>
        {model.counter.View} {/* Render Counter */}
      </div>
    )
  };
  const model = UECA.useComponent(struct);
  return model;
}

const App = UECA.getFC(useApp);
export default App;
```

## Best Practices
- **Use Minimal Sections**: Only include necessary sections (e.g., `props`, `methods`, `View`) to keep components lightweight.
- **Leverage Type Safety**: Always define `props` and other sections with TypeScript for robust integration.
- **Keep View Simple**: Delegate complex logic to methods, private methods or lifecycle hooks.
- **Export Model Type**: Ensure `MyCompModel` is exported for parent components to use in their `children` section.
- **Organize Private Methods**: Place helper functions after the `return model` statement for clarity.
- **Private Members**: Prefix names of private properties and methods with `_` for better organizing.

## Notes
- All template sections (`props`, `events`, `methods`, etc.) including `View` and hooks (`constr`, `init`, `deinit`, etc.) are optional.
- The model is reactive by default, powered by MobX, ensuring automatic UI updates when properties in `props` change.
- Only initialized properties in `props` are reactive (MobX observable), but properties starting with two underscores (e.g., `__itemList`) are non-reactive and considered private.
- Model properties and methods which names end with `View` are MobX observers (e.g. `TableHeaderView`).
- Components are cached (controlled by `cacheable` and `globalSettings.modelCacheMode`), preserving state across mounts.
