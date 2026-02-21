# Model Caching in UECA-React
#model_caching #state #reactivity #performance

## Description
Model caching in UECA-React is a powerful feature introduced in version 2.0 that enables components to persist their state across mounts and unmounts. By caching component models, UECA-React ensures that state is preserved when components are temporarily removed from the DOM (e.g., due to conditional rendering) and restored when they reappear. This enhances performance and improves user experience by maintaining state continuity without requiring manual state management.

Key aspects of model caching:
- **State Persistence**: Retains model state (e.g., form inputs, counters) during unmount/mount cycles.
- **Configurable Modes**: Supports `no-cache`, `cache`, and `auto-cache` modes via `UECA.globalSettings.modelCacheMode`.
- **Type-Safe**: Fully integrated with UECA’s TypeScript-based architecture.
- **Reactive**: Works seamlessly with MobX-driven reactivity.

---

## API/Methods

### Configuring Model Caching
- **UECA.globalSettings.modelCacheMode**  
  Sets the global caching mode for all component models.  
  - **Values**:  
    - `"no-cache"`: Disables caching; models are recreated on each mount.  
    - `"cache"`: Caches models only if their `cacheable` property is explicitly set to `true`.  
    - `"auto-cache"`: Automatically caches models unless `cacheable` is explicitly set to `false`.  
  - **Default**: `"auto-cache"`.

### Model Properties
- **cacheable**  
  A property in the component’s `props` that controls whether the model is cached.  
  - **Type**: `boolean | undefined`  
  - **Behavior**:  
    - `true`: Model is cached (in `"cache"` mode).  
    - `false`: Model is not cached (in `"auto-cache"` mode).  
    - `undefined`: Follows the global `modelCacheMode` (cached in `"auto-cache"`).

### Lifecycle Hooks
- **init()**: Called when a model is activated, either on creation or when retrieved from cache.  
- **deinit()**: Called when a model is deactivated, typically when it’s cached but no longer in use.

---

## Code Examples

### Example: Caching a Counter Component
This example demonstrates model caching with a `Counter` component that persists its state across mounts and a `Display` component that toggles its visibility.

```typescript
import * as UECA from "ueca-react";

// Enable auto-caching globally
UECA.globalSettings.modelCacheMode = "auto-cache";

type CounterStruct = UECA.ComponentStruct<{
    props: {
        count: number;
    }    
}>;

type CounterParams = UECA.ComponentParams<CounterStruct>;
type CounterModel = UECA.ComponentModel<CounterStruct>;

function useCounter(params?: CounterParams): CounterModel {
    const struct: CounterStruct = {
        props: {
            id: useCounter.name,
            count: 0
        },        
        init: () => {
            console.log("Model activated with count:", model.count);
        },
        deinit: () => {
            console.log("Model deactivated");
        },
        View: () => (
            <div id={model.htmlId()}>
                <p>Count: {model.count}</p>
                <button onClick={() => model.count++}>Increment</button>
            </div>
        )
    };
    const model = UECA.useComponent(struct, params);
    return model;
}

type DisplayStruct = UECA.ComponentStruct<{    
    children: {
        staticCounter: CounterModel;
        dynamicCounter: CounterModel; // Optional declaration for dynamic access
    };    
}>;

type DisplayStructParams = UECA.ComponentParams<DisplayStruct>;
type DisplayStructModel = UECA.ComponentModel<DisplayStruct>;

function useDisplay(params?: DisplayStructParams): DisplayStructModel {
    const struct: DisplayStruct = {
        props: {
            id: useDisplay.name            
        },
        children: {            
            staticCounter: useCounter({ 
                onChangeCount: () => console.log(`Static Counter changed to: ${model.staticCounter.count}`)
            })
        },
        View: () => (
            <div id={model.htmlId()}>                
                {/* Static child */}
                <model.staticCounter.View />
                {/* Dynamic child */}
                <Counter id={"dynamicCounter"}
                    onChangeCount={() => console.log(`Dynamic Counter changed to: ${model.dynamicCounter.count}`)}
                />
            </div>
        )
    };
    const model = UECA.useComponent(struct, params);
    return model;
}

const Counter = UECA.getFC(useCounter);
const Display = UECA.getFC(useDisplay);

export { CounterModel, useCounter, Counter, useDisplay, Display };
```

- **Explanation**:  
  - **Global Configuration**: `UECA.globalSettings.modelCacheMode = "auto-cache"` enables caching for models unless `cacheable` is explicitly `false`.  
  - **Counter Component**: The `Counter` component persists its `count` state across mounts/unmounts due to caching. The `init` and `deinit` hooks log model activation/deactivation.  
  - **Display Component**: The `staticCounter` is a cached child model, and `dynamicCounter` is a dynamically instantiated component. Both maintain state when toggled in/out of the DOM.  
  - **Behavior**: Incrementing the counter and toggling visibility (e.g., via conditional rendering) preserves the `count` value, demonstrating state continuity.

---

## Best Practices
- **Choose the Right Mode**: Use `"auto-cache"` for most applications to balance performance and simplicity. Reserve `"cache"` for explicit control or `"no-cache"` for version 1.0 behavior.  
- **Set `cacheable` Explicitly**: When needed, define `cacheable` in `props` to override the global mode (e.g., `cacheable: false` for transient components).  
- **Optimize `init` and `deinit`**: Use these hooks for setup/cleanup tasks (e.g., subscriptions) to manage resources efficiently during caching cycles.  
- **Monitor Performance**: Avoid caching large models unnecessarily to prevent memory overhead.

---

## Notes
- Model caching is enabled by default in version 2.0 with `"auto-cache"`, but it requires careful configuration for optimal memory usage.  
- The `id` property (e.g., `id={"dynamicCounter"}`) is critical for cache identification, ensuring models are correctly restored.  
- Caching integrates with UECA’s reactivity, preserving state changes made via MobX observables.