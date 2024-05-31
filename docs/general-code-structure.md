# UECA General Code Structure

This section will guide you through the general structure of UECA components, explaining each section with simple code examples.

## Component Structure

Each UECA component follows a [structured template](./code-template.md) that includes properties (`props`), events (`events`), children (`children`), methods (`methods`), and messages (`messages`). Let's break down each part of the structure.

### Example Component: MyComponent

```typescript
import * as React from "react";
import * as UEC from "ueca-react";

// Component structure declaration
type MyComponentStruct = UEC.ComponentStruct<{
  props: {
    title: string;
  };

  events: {
    onAction: () => void;
  };

  children: {
    childComponent: ChildComponentModel;
  };

  methods: {       
    performAction: () => void;
  };  
}>;

type MyComponentParams = UEC.ComponentParams<MyComponentStruct>;
type MyComponentModel = UEC.ComponentModel<MyComponentStruct>;

function useMyComponent(params?: MyComponentParams): MyComponentModel {
  const struct: MyComponentStruct = {
    props: {
      title: "Default Title",
    },

    events: {
      onAction: () => {
        console.log("Action triggered");
      },
    },

    children: {
      childComponent: useChildComponent(),
    },

    methods: {
      performAction: () => {
        console.log("Action performed");
      },
    },

    messages: {
      "Component.Message": (payload: { data: string }) => {
        console.log(`Message received with data: ${payload.data}`);
      },
    },

    init: () => {
      console.log("Component initialized");
    },

    mount: () => {
      console.log("Component mounted");
    },

    unmount: () => {
      console.log("Component unmounted");
    },

    View: () => (
      <div>
        <h1>{model.title}</h1>
        <button onClick={() => model.performAction()}>
          Perform Action
        </button>
        <model.childComponent.View />
      </div>
    ),
  };

  const model: MyComponentModel = UEC.useComponent(struct, params);
  return model;

  // Private methods
}

const MyComponent = UEC.getFC(useMyComponent);

export { MyComponentModel, useMyComponent, MyComponent };
```

### Explanation of Each Section

1. **Props**:
   - Props are the properties of the component, serving as the inputs. They are defined in the `props` section of the `struct`.

    ```typescript
    props: {
      title: "Default Title",
    },
    ```

2. **Events**:
   - Events are custom events that the component can trigger and handle. They are defined in the `events` section.

    ```typescript
    events: {
      onAction: () => {
        console.log("Action triggered");
      },
    },
    ```

3. **Children**:
   - Children are the child components nested within this component. They are defined in the `children` section.

    ```typescript
    children: {
      childComponent: useChildComponent(),
    },
    ```

4. **Methods**:
   - Methods are the functions that the component can execute. They are defined in the `methods` section.

    ```typescript
    methods: {
      performAction: () => {
        console.log("Action performed");
      },
    },
    ```

5. **Lifecycle Hooks**:
   - **Init**: Runs once when the component is created.
   - **Mount**: Runs when the component mounts to React DOM.
   - **Unmount**: Runs when the component unmounts from React DOM.

    ```typescript
    init: () => {
      console.log("Component initialized");
    },

    mount: () => {
      console.log("Component mounted");
    },

    unmount: () => {
      console.log("Component unmounted");
    },
    ```

6. **View**:
   - The `View` function defines the JSX that represents the component's UI.

    ```typescript
    View: () => (
      <div>
        <h1>{model.title}</h1>
        <button onClick={() => model.performAction()}>
          Perform Action
        </button>
        <model.childComponent.View />
      </div>
    ),
    ```

### Conclusion

This template provides a comprehensive scaffold for creating UECA components. By following this structure, you ensure that your components are modular, maintainable, and adhere to the principles of UECA. Use this guide as a reference for building new components and extending the functionality of your React application.
