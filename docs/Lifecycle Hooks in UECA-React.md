# Lifecycle Hooks in UECA-React
#lifecycle #hooks #basics #api #example #best_practices

## Description
Lifecycle hooks in UECA-React provide a structured and predictable approach to managing a component’s behavior across its lifecycle stages. Unlike React’s `useEffect`, which relies on dependency arrays and can lead to complex logic, UECA-React offers a granular set of hooks that execute at specific points, such as model creation, DOM mounting, or UI rendering. Each hook receives the component’s `model`, enabling direct access to state, methods, and metadata, which is particularly powerful for dynamically created JSX content. This article details the lifecycle hooks, their sequence, chaining behavior, and centralized error handling.

### Key Concepts
- **Lifecycle Hooks**: Functions invoked at defined lifecycle stages.
- **Granular Control**: Hooks for creation, initialization, mounting, rendering, and cleanup.
- **Model Parameter**: Provides access to component properties, methods, and metadata (e.g., `fullId()`, `birthMark()`).
- **Chaining**: Hooks and event handlers passed in JSX chain with those defined in the component’s model.
- **Centralized Error Handling**: All errors (sync or async) are managed via `UECA.globalSettings.errorHandler`.

## Overview of Lifecycle Hooks

UECA-React provides the following hooks, each receiving the component’s `model`:

1. **`constr(model)`**  
   - **When**: Called once when the model is instantiated.  
   - **Purpose**: One-time setup, like initializing non-reactive state or API clients.  
   - **Example Use Case**: Fetching initial data.

2. **`init(model)`**  
   - **When**: Called after `constr()` on creation or cache retrieval.  
   - **Purpose**: Initialization tasks for model activation, like resetting state.  
   - **Example Use Case**: Subscribing to a WebSocket.

3. **`mount(model)`**  
   - **When**: Called when the component mounts to the DOM.  
   - **Purpose**: DOM-related setup, like adding listeners.  
   - **Example Use Case**: Attaching a resize listener.

4. **`draw(model)`**  
   - **When**: Called after view rendering.  
   - **Purpose**: Post-render logic, similar to `useLayoutEffect`.  
   - **Example Use Case**: Adjusting UI positions.

5. **`erase(model)`**  
   - **When**: Called before UI removal.  
   - **Purpose**: Cleanup of UI resources before unmounting.  
   - **Example Use Case**: Clearing animations.

6. **`unmount(model)`**  
   - **When**: Called when the component is removed from the DOM.  
   - **Purpose**: DOM resource cleanup, like removing listeners.  
   - **Example Use Case**: Detaching a resize listener.

7. **`deinit(model)`**  
   - **When**: Called when the component loses React context (e.g., cached but inactive).  
   - **Purpose**: Cleanup of resources during deactivation.  
   - **Example Use Case**: Unsubscribing from a WebSocket.

**Note**: No `destr()` hook exists due to JavaScript garbage collection unpredictability; use `deinit()` for cleanup.

## Sequence of Lifecycle Hooks
Hooks execute in this order:
1. `constr()` → Model creation.
2. `init()` → Model activation.
3. `mount()` → DOM attachment.
4. `draw()` → UI rendering.
5. `erase()` → UI removal preparation.
6. `unmount()` → DOM detachment.
7. `deinit()` → Model deactivation.

## Model Parameter
Each hook receives the component’s `model`, enabling access to properties (`model.count`), methods (`model.increment`), and metadata (`fullId()`, `birthMark()`). This is critical for **dynamic JSX**, where inline lifecycle hooks can customize behavior using `model`.

## Centralized Error Handling
All errors—synchronous or asynchronous—in hooks, methods, event handlers, or custom code are captured by `UECA.globalSettings.errorHandler`. This eliminates the need for try-catch blocks, streamlining error management.

```typescript
import * as UECA from "ueca-react";

// Configure global error handler
UECA.globalSettings.errorHandler = (error: Error) => {
  console.error(`Error: ${error.message}`);
  // Send a message to Message Bus to display the error dialog
  UECA.defaultMessageBus<AppMessage>().unicast("App.UnhandledException", error);
};
```

- **Sync Errors**: Caught automatically (e.g., invalid state in `init`).  
- **Async Errors**: Handled from `async` hooks or methods without try-catch.

## Chaining Hooks and Event Handlers
Hooks and event handlers passed as `params` in JSX are **chained** with those defined in the component’s model hook. Chaining executes the model-defined handler first, followed by the JSX-passed handler, allowing layered logic.

---

## Code Examples

### Example 1: Lifecycle Hooks with Centralized Error Handling
A counter component logs lifecycle events and uses global error handling.

```typescript
import * as UECA from "ueca-react";

type CounterStruct = UECA.ComponentStruct<{
  props: { count: number };
  methods: { increment: () => void };
}>;

type CounterParams = UECA.ComponentParams<CounterStruct>;
type CounterModel = UECA.ComponentModel<CounterStruct>;

function useCounter(params?: CounterParams): CounterModel {
  const struct: CounterStruct = {
    props: {
      id: useCounter.name,
      count: 0
    },
    constr: (model) => console.log(`constr: Model created: ${model.birthMark()}`),
    init: async (model) => {
      console.log(`init: Model initialized: ${model.fullId()}`);
      // Simulate async error (handled by globalSettings.errorHandler)
      if (Math.random() > 0.8) throw new Error("Init failed");
      model.count = 0;
    },
    deinit: (model) => console.log(`deinit: Model deactivated: ${model.fullId()}`),
    mount: (model) => console.log(`mount: Component mounted: ${model.fullId()}`),
    unmount: (model) => console.log(`unmount: Component removed: ${model.fullId()}`),
    draw: (model) => console.log(`draw: UI rendered: ${model.fullId()}`),
    erase: (model) => console.log(`erase: UI about to be removed: ${model.fullId()}`),
    methods: {
      increment: () => model.count++,
    },
    View: () => (
      <div id={model.htmlId()}>
        <p>Counter: {model.count}</p>
        <button onClick={model.increment}>Increment</button>
      </div>
    ),
  };
  const model = UECA.useComponent(struct, params);
  return model;
}

const Counter = UECA.getFC(useCounter);
export { CounterModel, useCounter, Counter };
```

- **Explanation**:  
  - Hooks use `model` parameter to log `birthMark()` or `fullId()`.  
  - `init` includes an async operation with potential errors, managed globally.  
  - The component resets `count` and logs lifecycle stages.

### Example 2: Dynamic JSX with Chained Hooks
This example shows a dynamically created `Counter` with chained lifecycle hooks.

```typescript
import * as UECA from "ueca-react";

type AppStruct = UECA.ComponentStruct<{
  props: { showCounter: boolean };
}>;

function useApp(): UECA.ComponentModel<AppStruct> {
  const struct: AppStruct = {
    props: { 
      id: useApp.name,
      showCounter: true;
    },
    View: () => (
      <div id={model.htmlId()}>
        <button onClick={() => (model.showCounter = !model.showCounter)}>
          Toggle Counter
        </button>
        {model.showCounter && (
          <Counter
            id={"counter1"}
            constr={(counter_model) => console.log(`JSX constr: ${counter_model.birthMark()}`)}
            init={(counter_model) => {
              console.log(`JSX init: ${counter_model.fullId()}`);
              counter_model.count = 10;
            }}
            onChangeCount={(newValue) => console.log(`JSX count changed: ${newValue}`)}
          />
        )}
      </div>
    ),
  };
  const model = UECA.useComponent(struct, params);
  return model;
}

const App = UECA.getFC(useApp);
export { App };
```

- **Explanation**:  
  - The `Counter` is instantiated dynamically in JSX with inline `constr`, `init`, and `onChangeCount`.  
  - Model-defined hooks (e.g., `init` in `useCounter`) execute first, followed by JSX-passed hooks, chaining their logic.  
  - The `onChangeCount` event handler in JSX chains with any model-defined handler, logging count changes.  
  - Errors in inline hooks are caught by `globalSettings.errorHandler`.

---

## Best Practices
- **Use `constr` for One-Time Setup**: Initialize static resources like API clients.  
- **Leverage `init` and `deinit` for Activation**: Manage subscriptions or state resets.  
- **Keep `mount` and `unmount` DOM-Specific**: Focus on DOM interactions.  
- **Optimize `draw` and `erase` for UI**: Handle render-related tasks.  
- **Use Global Error Handling**: Rely on `globalSettings.errorHandler` for all errors.  
- **Chain Hooks Judiciously**: Ensure JSX-passed hooks complement model-defined ones without redundancy.

---

## Comparison to Traditional React
React’s `useEffect` requires dependency arrays, often leading to stale closures or complex cleanup. UECA-React hooks:
- **Eliminate Dependencies**: Fixed execution order simplifies logic.  
- **Clarify Intent**: Named hooks are self-explanatory.  
- **Enable Chaining**: JSX-passed hooks extend model-defined logic.  
- **Streamline Errors**: Centralized handling reduces boilerplate.

Example in React:
```typescript
useEffect(() => {
  console.log("Mounted");
  return () => console.log("Unmounted");
}, []);
```

In UECA-React:
```typescript
mount: (model) => console.log(`Mounted: ${model.fullId()}`),
unmount: (model) => console.log(`Unmounted: ${model.fullId()}`),
```

---

## Notes
- Hooks are optional; omit unused ones for efficiency.  
- Asynchronous hooks support tasks like API calls, with errors managed globally.  
- The `model` parameter enables dynamic JSX customization, accessing model state, methods, etc.
- Chaining applies to both hooks and event handlers, executing model-defined logic first.  
- When using model caching (version 2.0), `init` and `deinit` manage cache cycles.  
- Test chained hooks/handlers to ensure combined logic behaves as expected.