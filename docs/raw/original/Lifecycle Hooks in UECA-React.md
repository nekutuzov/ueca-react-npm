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

3. **`draw(model)`**  
   - **When**: Called after view rendering, before the browser paints.  
   - **Purpose**: Post-render logic, similar to `useLayoutEffect`. Must be **synchronous** — see Notes.  
   - **Example Use Case**: Adjusting UI positions.

4. **`mount(model)`**  
   - **When**: Called when the component mounts to the DOM.  
   - **Purpose**: DOM-related setup, like adding listeners.  
   - **Example Use Case**: Attaching a resize listener.

5. **`erase(model)`**  
   - **When**: Called before UI removal.  
   - **Purpose**: Cleanup of UI resources before unmounting. Must be **synchronous** — see Notes.  
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
3. `draw()` → UI rendering.
4. `mount()` → DOM attachment.
5. `erase()` → UI removal preparation.
6. `unmount()` → DOM detachment.
7. `deinit()` → Model deactivation.

`draw()` runs before `mount()` because it is a layout-phase hook and `mount()` a passive one: React flushes layout effects before passive effects, so the view has been drawn by the time `mount()` sees the DOM. On teardown the mirror image holds — `erase()` precedes `unmount()`. Within each hook the model-defined handler runs first and the JSX-passed handler second (see Chaining below), and each pair completes before the next hook starts.

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

### A lifecycle hook must not throw
Reporting an error is not the same as recovering from one. Whatever a throwing hook had not finished stays unfinished, and the framework does **not** retry it — a retry would only cover up the real fault.

What the framework does do is keep its own state machine moving. Every phase settles whether the hook succeeded or not, because a phase records how far the machine has got, not whether your code worked. So the rest of the life still happens:

| Hook throws | What is left |
| --- | --- |
| `constr` | `init` never gets its turn and `invalidateView()` is never reached, so the component renders nothing, ever |
| `init` | `initPhase` settles at `"initialized"`; `draw`, `mount`, `unmount` and `deinit` all run as usual, with whatever `init` had not done left undone |
| `mount` | `mountPhase` settles at `"mounted"`, so `unmount` runs on teardown and a later cache cycle mounts the model again — and calls the failing hook again |
| `unmount` | `mountPhase` clears, so `deinit` is still reached and the model returns to `"constructed"` |

`constr` is the exception, and only because nothing downstream of it can meaningfully run: the model was never constructed.

Do not write hooks that can throw — validate inside them, and handle what you can handle. A model whose hook failed is missing whatever that hook was for, and the application around it may be broken even though its lifecycle is intact. The error itself is not lost: every one of these hooks is `async`, so a throw becomes an unhandled promise rejection, which the framework's `window` listener passes to `globalSettings.errorHandler`. **Set that handler**; without it an unhandled rejection is all the application ever sees.

### Teardown settles just after the unmount, not during it
`unmount()` and `deinit()` do not run inside React's unmount — they run immediately after it, once the
render commit has settled.

The reason is that React runs every effect cleanup in a commit before every effect setup, so a component
being **re-rendered** looks momentarily exactly like a component being **removed**. Deciding on the spot
would tear a model down on every render. The framework waits out the commit and then asks again: a
re-render has put the component back by that point, a real unmount has not.

This matters in exactly one place — a test, or application code, that unmounts and then immediately checks
what teardown did:

```typescript
unmount();
// unmount() and deinit() have NOT run yet
await Promise.resolve();      // let the commit settle
// now they have
```

Nothing about the order changes: `erase` still precedes `unmount`, which still precedes `deinit`. Only the
moment the last two begin moves, by one microtask.

> **React.StrictMode works.** It renders everything twice and throws the first pass away, which is exactly
> what this settling — and the ownership rule in [Component IDs](Component%20IDs%20in%20UECA-React.md) — are
> there to survive. Lifecycle counts, hook order, component identity, DOM ids, bus addressing and cached
> state all behave the same with it on as with it off.

### A View that throws is retried, then contained
A hook and a `View` fail differently. Every component's `View` renders inside its own error boundary, so a throw is contained to that component rather than blanking everything above it.

The boundary re-renders the component `globalSettings.renderRetries` times before it gives up — **default 1**. That is there for the genuinely transient failure: a value that was not ready on the first pass and is on the second. The error only reaches `globalSettings.errorHandler` once the retries are spent, so a failure that clears itself is never reported. Set `renderRetries` to `0` to skip retrying and hear about the first failure immediately.

Once the retries are spent the component stays blank for the rest of its life — nothing resets the boundary, so a `View` that starts working again is not noticed. Treat a retry as a grace period, not as recovery, and keep `View` free of logic that can throw.

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

type AppParams = UECA.ComponentParams<AppStruct>;

function useApp(params?: AppParams): UECA.ComponentModel<AppStruct> {
  const struct: AppStruct = {
    props: { 
      id: useApp.name,
      showCounter: true
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
- **Never Let a Hook Throw**: A throwing hook leaves the model invalid and it is not recovered — see [A lifecycle hook must not throw](#a-lifecycle-hook-must-not-throw).  
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
- Asynchronous hooks support tasks like API calls, with errors managed globally. This applies to `constr`, `init`, `mount`, `unmount` and `deinit`. `draw` and `erase` are the exception: they run in React's layout phase, which is never awaited, so an `async` handler there could not delay anything it was meant to sequence. They must be synchronous, and a handler that returns a `Promise` is rejected with an error ("Asynchronous draw hook is not allowed").  
- The `model` parameter enables dynamic JSX customization, accessing model state, methods, etc.
- Chaining applies to both hooks and event handlers, executing model-defined logic first.  
- When using model caching (version 2.0), `init` and `deinit` manage cache cycles.  
- Test chained hooks/handlers to ensure combined logic behaves as expected.