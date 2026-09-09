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
- **deinit()**: Called when a model is deactivated, typically when it's cached but no longer in use.

---

## How a cached model is found again

Caching only helps if the framework can recognise, on the next render, that a model it already has belongs to
the component now being drawn. There are **two caches, with two different keys**, and which one a child lands
in depends on how you created it. Most caching surprises come from not knowing which is in play.

### Children created by a hook call — cached **by position**

A child declared in a `children` section is created by calling its hook:

```typescript
children: {
    firstNameInput: useInput({ … }),     // slot 0
    lastNameInput: useInput({ … }),      // slot 1
    saveButton: useButton({ … })         // slot 2
}
```

These are matched up on the next render **by call order**: the first hook call gets slot 0, the second slot
1, and so on. No `id` is involved. Every hook call occupies exactly one slot, including one whose model is
not cacheable — that slot simply holds a placeholder, so the numbering of everything after it is unaffected.

This is the same rule React applies to its own hooks, and it has the same consequence:

> **Never call a component hook conditionally.** Wrapping one in an `if`, or calling it inside a loop whose
> length varies, shifts every slot after it — and each of those children then finds the previous sibling's
> model instead of its own. Nothing detects this. Declare all the children unconditionally and control what
> is *rendered* in the `View`.

```typescript
// WRONG — the slots move when showAdvanced flips
children: {
    ...(model.showAdvanced ? { advanced: useAdvancedPanel({}) } : {}),
    footer: useFooter({})
}

// RIGHT — always created, conditionally drawn
children: {
    advanced: useAdvancedPanel({}),
    footer: useFooter({})
},
View: () =>
    <div id={model.htmlId()}>
        <UECA.IF condition={model.showAdvanced}>
            <model.advanced.View />
        </UECA.IF>
        <model.footer.View />
    </div>
```

### Children instantiated as JSX — cached **by `id`**

A child rendered as an element is matched by its `id`, held on the parent model:

```typescript
View: () =>
    <div id={model.htmlId()}>
        <Counter id={"dynamicCounter"} />
    </div>
```

That makes two things load-bearing:

- **The `id` must be stable across renders.** An `id` built from something that changes — an index into a
  list that reorders, a timestamp — produces a new model every render and caches nothing.
- **The `id` must be unique among its siblings.** Two children of one parent with the same `id` would
  silently share a single model, so this is refused: rendering them throws. The same `id` under two
  *different* parents is fine, because the full path differs. When children come from a list, build each
  `id` from the item's own key — `id={"row-" + item.id}` — never from a constant.

A child with **no** `id` cannot be cached at all: there is no key to find it by. The framework warns, and a
fresh model is built on every render.

### What invalidates a cache

- **The parent is not cached.** A cache lives *on* the parent model, so if the parent is rebuilt the whole
  subtree beneath it is rebuilt with it. Setting `cacheable: false` on a component therefore discards its
  children's state as well as its own — this is the usual explanation for "I cached the child but it still
  resets".
- **`model.clearModelCache()`** drops every cached child of that model, both kinds, recursively. Use it when
  a screen should genuinely start fresh — after a logout, or when the record being edited is replaced.
- **`modelCacheMode = "no-cache"`** globally disables both caches.

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
- A cached model keeps its state, including the values of its properties. Parameters written at hook call time — the way a static child is created in a `children` section — are applied while the model starts up and are **not** applied again when it is taken from the cache. A component instantiated as JSX is the exception: its parent supplies the parameters again on every render, so they are assigned again each time. Use a binding or a function parameter when a child has to follow a value that changes.
- `cacheable` is resolved **once**, when the model is created, and cannot be a binding — passing one throws. A component that must sometimes keep its state and sometimes not is better served by calling `clearModelCache()` on its parent at the moment the state should be dropped.
- **Caching changes nothing about identity.** `fullId()`, the DOM id and the bus address are the same whether a model came from the cache or was just built, and turning caching off does not re-address anything.