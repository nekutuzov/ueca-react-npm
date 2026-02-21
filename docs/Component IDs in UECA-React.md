# Component IDs in UECA-React
#component-ids #basics #api #example #best_practices

## Description
In UECA-React, every component is assigned a unique identifier, or **ID**, which plays a critical role in managing the component's lifecycle, tracing, and integration with the DOM. The ID system ensures that each component can be uniquely identified within the application, which is essential for features like caching, logging, and automated testing. This article explains how component IDs are generated, how to use them, and their significance in the UECA-React ecosystem.

### Key Concepts
- **Component ID**: A unique string that identifies a component instance within the application.
- **Full ID**: A hierarchical path that represents the component's position in the parent-child structure (e.g., `app.ui.mainForm.button`).
- **HTML ID**: A DOM-compatible ID generated from the full ID, used to identify the component's root element in the DOM.
- **ID Initialization**: The ID is typically initialized using the hook's name for consistency and tracing purposes.

### Importance of Component IDs
- **Uniqueness**: Ensures each component can be distinctly identified, preventing conflicts in large applications.
- **Tracing**: Component IDs are used in logs to trace component creation, updates, and lifecycle events.
- **DOM Integration**: The HTML ID allows for easy selection and manipulation of the component's root element.
- **Testing**: Automated testing tools (e.g., UI Vision) can use the HTML ID to interact with specific components.

## How Component IDs Work

### 1. Initializing the Component ID
When defining a UECA component, the `id` property is typically set in the `props` section of the component structure. By convention, it is initialized to the name of the custom hook (e.g., `useMyComponent.name`), which provides a default unique identifier.

```typescript
props: {
  id: useMyComponent.name, // e.g., "myComponent"
}
```

- **Note**: The `id` is a built-in property provided by `UECA.ComponentStruct` and is automatically included in the model. It can be overridden if needed, but using the hook's name is a best practice for consistency.

### 2. Full ID
The **full ID** is a hierarchical string that represents the component's path in the parent-child structure. It is constructed by concatenating the IDs of all parent components, separated by dots.

For example, if a `Button` component is nested inside a `Form` component, which is inside the `App` component, the full ID of the button would be:
```
app.form.button
```

- **Accessing the Full ID**: The full ID can be retrieved using the `model.fullId()` method.
  ```typescript
  const fullId = model.fullId(); // e.g., "app.form.button"
  ```

### 3. HTML ID
The **HTML ID** is derived from the full ID and is used as the `id` attribute for the component's root element in the DOM. In development, it typically matches the full ID, but in production, it can be hashed for optimization.

- **Accessing the HTML ID**: The HTML ID can be retrieved using the `model.htmlId()` method.
  ```typescript
  const htmlId = model.htmlId(); // e.g., "app.form.button" or a hashed version
  ```

- **Usage in JSX**: The HTML ID should be applied to the top-level element in the component's `View`.
  ```typescript
  View: () => (
    <div id={model.htmlId()}>
      {/* Component UI */}
    </div>
  )
  ```

### 4. ID in Tracing
Component IDs are essential for tracing. When `globalSettings.traceLog` is enabled, the framework logs events such as model creation, property changes, and lifecycle hooks, using the component's ID for identification.

- **Example Log Entry**:
  ```
  create model=#123456 path=useMyComponent
  change prop model=#123456 path=app.ui.myComponent[count] 0➝1
  ```

- The `path` in the log corresponds to the component's full ID, making it easy to trace events back to specific components.

## API/Methods
- **`model.fullId(): string`**: Returns the full hierarchical ID of the component.
- **`model.htmlId(): string`**: Returns the DOM-compatible ID for the component's root element.
- **`model.id: string`**: The unique identifier of the component instance.

## Code Example

### Simple Button Component with ID
This example demonstrates how to initialize and use the component ID in a simple button component.

```typescript
import * as UECA from "ueca-react";

// Declare the component structure
type ButtonStruct = UECA.ComponentStruct<{
  props: {
    caption: string;
  };
  methods: {
    click: () => void;
  };
}>;

// Declare the parameters type
type ButtonParams = UECA.ComponentParams<ButtonStruct>;

// Declare the model type
type ButtonModel = UECA.ComponentModel<ButtonStruct>;

// Custom hook
function useButton(params?: ButtonParams): ButtonModel {
  const struct: ButtonStruct = {
    props: {
      id: useButton.name,
      caption: "Click Me", // Default caption
    },
    methods: {
      click: () => {
        console.log(`Button ${model.id} clicked`);
      },
    },
    View: () => (
      <button id={model.htmlId()} onClick={model.click}>
        {model.caption}
      </button>
    ),
  };
  const model = UECA.useComponent(struct, params);
  return model;
}

// Functional component
const Button = UECA.getFC(useButton);

// Export for use in parent components
export { ButtonModel, useButton, Button };
```

### Using the Button in a Parent Component
This example shows how to integrate the `Button` component into a parent component and access its ID.

```typescript
import * as UECA from "ueca-react";
import { useButton, ButtonModel } from "./Button";

type AppStruct = UECA.ComponentStruct<{
  children: {
    button: ButtonModel;
  };
}>;

function useApp(): UECA.ComponentModel<AppStruct> {
  const struct: AppStruct = {
    props: {
      id: "App"
    },
    children: {
      button: useButton({ caption: "Submit" }), // Initialize Button with custom caption
    },
    View: () => (
      <div id={model.htmlId()}>
        <h1>App</h1>
        {model.button.View}
        <p>Button ID: {model.button.id}</p>
        <p>Button Full ID: {model.button.fullId()}</p>
      </div>
    ),
  };
  const model = UECA.useComponent(struct);
  return model;
}

const App = UECA.getFC(useApp);
export default App;
```

- The parent component accesses the button's ID and full ID via `model.button.id` and `model.button.fullId()`.

## Best Practices
- **Initialize ID with Hook Name**: Always set `id: useMyComponent.name` in the `props` section for consistency and easier tracing.
- **Use Full ID for Logging**: When logging custom messages, include the full ID to trace the component's location in the hierarchy.
- **Apply HTML ID to Root Element**: Always set `id={model.htmlId()}` on the top-level JSX element to ensure proper DOM integration.
- **Avoid Manual ID Overrides**: Unless necessary, avoid overriding the ID after model creation to maintain uniqueness.
- **Use IDs in Tests**: Leverage the HTML ID in automated tests to target specific components (e.g., with UI Vision).

## Notes
- The `id` is automatically included in the model as a built-in property and does not need to be redefined in the component's `props` unless overriding the default value.
- In production, the HTML ID can be hashed for optimization by setting `globalSettings.hashHtmlId = true`.
- The full ID is constructed dynamically based on the component hierarchy, ensuring uniqueness even for components with the same base ID.