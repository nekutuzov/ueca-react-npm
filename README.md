![logo](/docs/logo.png)
# UECA-React

## Why UECA?

Building large-scale React apps can be a mess—complex code, bug-prone patterns, and endless refactoring. UECA (Unified Encapsulated Component Architecture) changes that. Born as a pet project, it simplifies React development by hiding the low-level chaos behind a clean, unified structure.

Curious about easier React development? Here’s what UECA brings to the table:

**Simple Learning Curve**: No React or MobX expertise needed—just plain TypeScript and JSX.
```typescript
const struct = { 
  props: {text: "" },
  View: () => <div>{model.text}</div>
};
```

**Single Principle**: Model-View approach keeps code predictable.
```typescript
View: () => <button onClick={() => model.onClick?.()}>{model.text}</button>
```

**Strong Typing Everywhere**: Full TypeScript support ensures safety and clarity across all components.
```typescript
// 'API.getTime' is literal type
model.time = await model.bus.getAsync("API.getTime");
  
// 'onChangeTemperature' is auto-event for property 'temperature'
onChangeTemperature={() => { console.log("Temperature changed"); }}
```

**Unique Component IDs:** Built-in id property for clear identification and DOM integration.
```typescript
View: () => <div id={model.htmlId()}>{model.caption}</div>
```

**Homogeneous Structure**: Every component looks the same—easy to read, review, and test.
```typescript
type ButtonStruct = UEC.ComponentStruct<{
  props: {
    caption: string;
    clickMode: "click" | "toggle";
    active: boolean;
    disabled: boolean;
  };

  events: {
    onClick: () => void;
  };

  methods: {
    click: () => void;
  };
}>;
```

**Stateful Simplicity**: State (MobX) and React are hidden, freeing you for business logic.
```typescript
model.value = "new text"; // Fires onChangeValue event and auto-updates UI
```

**Powerful Bindings**: Link properties effortlessly.
```typescript
lastNameInput: useInput({
  label: "Last Name:",    
  value: UEC.bindProp(() => model, "lastName"), // two-ways binding
  disabled: () => !model.allowEditing  // one-way binding
}),
```

**Built-in Events**: Automatic `onChange`/`onChanging` events when property changes.
```typescript
onChangeTemperature={() => { model.pressure = model.calcPressure(model.temperature); }}
```

**Message Bus**: Async communication between components.
```typescript
messages: { 
  "API.getItemName": async (id) => await model.apiClient.get("get-item-name?id:", { id })
},
```

**Lifecycle Hooks**: `init`, `mount`, `unmount` out of the box.
```typescript
init: async () => {
  model.itemName = await model.bus.getAsync("API.getItemName", { id: model.itemId }),
} 
```
**Debug Logging:** Enable componentModelDebug to trace component creation, property changes, and rendering.
```typescript
// In browser console:
componentModelDebug = true;

// Example log:
create model=#123456 path=useButton
change prop model=#123456 path=app.ui.mainForm.button[caption] ""➝"Click Me"
render view model=#123456 path=app.ui.mainForm.button
```

**Large Scale**: Perfect for large-scale apps, proven in production.

**Easier Project Management**: Team leads and architects breathe easier with UECA.
Its uniform component structure and strong typing mean predictable code—no wild variations or guesswork. Onboarding is fast, reviews are straightforward, and scaling doesn’t spiral out of control. Spend less time micromanaging and more on steering the project.

UECA saved a real-world project from collapse, turning chaos into a shipped product. Ready to simplify your React journey? Try it out!

Questions? Reach me at [cranesoft@protonmail.com](mailto:cranesoft@protonmail.com). Happy coding!

## Current Version: 1.0.7

The latest stable release of `ueca-react` is version 1.0.7. This version provides a solid UECA foundation for building React applications.

### Installation
```bash
npm install ueca-react
```
Dependency npm packages (react, react-dom, lodash) should be installed separately in your React project. Compatible React versions: 16.8.0–19.1.0. Ensure your react-dom version matches your react version.

## Upcoming Version: 2.0

Version 2.0 of `ueca-react` is in development and testing, bringing a major upgrade:

- **Fresh Core**: Rewritten from scratch for rock-solid consistency.
- **Dynamic Content**: Seamless support for functional components in JSX.
- **Model Cache**: Models persist through unmounts, reused on remount.
- **New Lifecycle**: `constr`, `init`, `deinit`, `mount`, `unmount`, `draw`, `erase` hooks for finer control.
- **Async Power**: Better async handling with centralized error management.
- **Advanced Messaging**: `broadcast`, `castTo`, and `unicast` for flexible communication.
- **Richer Event Log**: Enhanced component model logging.

Stay tuned—2.0 will turbocharge your UECA projects! Meanwhile, 1.0.7 keeps things steady.

## Getting Started
Check out the [examples](https://codesandbox.io/p/sandbox/frosty-banach-jsf84c) and [documentation](/docs/index.md) to start building with `ueca-react`. For questions or contributions, feel free to reach out at [cranesoft@protonmail.com](mailto:cranesoft@protonmail.com).
