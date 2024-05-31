# UECA Base Concepts

This section covers the base concepts of UECA, providing you with a foundational understanding of the architecture and its principles. By mastering these concepts, you'll be well-equipped to develop scalable, maintainable, and modular applications.

## Introduction to UECA

UECA is a modern framework designed to enhance the development of web applications by promoting encapsulation, modularity, and maintainability. It leverages TypeScript and JSX to create robust, type-safe components with minimal reliance on React-specific features.

## Core Principles of UECA

### Encapsulation

Encapsulation is a core principle of UECA, ensuring that each component manages its own state and behavior while exposing only necessary interfaces. This reduces code complexity and enhances maintainability by keeping implementation details hidden from other components.

### Declarative and Modular Code Style

UECA emphasizes a declarative and modular approach to coding. This means focusing on what the application should do rather than how it should do it, and breaking down the application into smaller, reusable components. This approach enhances readability and maintainability.

### Minimal React Usage

UECA uses React's custom hooks for component model instantiation but avoids other React features like class components, `useState`, and `useEffect`. This simplifies the architecture and makes the codebase more approachable for developers with a TypeScript background.

### Consistency

Consistency is key in UECA. By using [standard code templates](./code-template.md) and maintaining a uniform structure across components, developers can easily navigate and understand the codebase. This consistency reduces the cognitive load and helps maintain high code quality.

## Base Components of UECA

### TypeScript

TypeScript is the primary language used in UECA development. It provides static typing, enhancing code quality and maintainability. TypeScript's type system helps catch errors early and ensures that components are used correctly throughout the application.

### JSX

JSX is used to describe the UI in a syntax familiar to both JavaScript and HTML. Combined with TypeScript, JSX allows for type-checked components, reducing runtime errors and improving development efficiency.

### React Custom Hooks

Custom hooks are the only React feature heavily used in UECA. They are employed to instantiate and manage the lifecycle of component models, integrating React’s state and effect management seamlessly into UECA.

## Component Structure

A typical UECA component consists of the following sections:

### Props

Props are properties that serve as inputs to the component. They define the initial state and configuration of the component.

```typescript
props: {
  title: "Default Title",
},
```

### Events

Events are custom events that the component can trigger and handle. They allow for interaction and communication within the component.

```typescript
events: {
  onAction: () => {
    console.log("Action triggered");
  },
},
```

### Children

Children are the nested components within this component. They promote reusability and modularity by allowing components to be composed together.

```typescript
children: {
  childComponent: useChildComponent(),
},
```

### Methods

Methods are functions that the component can execute. They define the behavior and logic of the component.

```typescript
methods: {
  performAction: () => {
    console.log("Action performed");
  },
  toolbarView: () => JSX.Element,
},
```

### Messages

Messages are used for inter-component communication via the message bus system. They promote a decoupled architecture by allowing components to send and receive messages without direct dependencies.

```typescript
messages: {
  "Component.Message": ({ data }) => {
    console.log(`Message received with data: ${data}`);
  },
},
```

### Lifecycle Hooks

Lifecycle hooks manage the initialization, mounting, and unmounting processes of the component.

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

### View

The `View` function defines the JSX that represents the component's UI. It should end with "View" if it returns JSX.

```typescript
View: () => (
  <div>
    <h1>{model.title}</h1>
    <button onClick={() => model.performAction()}>Perform Action</button>    
    <model.toolbarView />
    // highlight-start
    <model.childComponent.View>
    // highlight-end
  </div>
),
```

## Automatic Events

UECA supports automatic events for properties, such as `onChange$Property$` and `onChanging$Property$`. These events are triggered when a property changes, facilitating reactive programming within components.

### onChange$Property$

The `onChange$Property$` event is triggered after a property value is updated. It allows you to react to changes in the property.

```typescript
events: {
  onChangeTitle: (newValue: string) => {
    console.log(`Title changed to ${newValue}`);
  },
},
```

### onChanging$Property$

The `onChanging$Property$` event acts as a value change interceptor, allowing you to validate or modify the value before it is committed.

```typescript
events: {
  onChangingTitle: (newValue: string, oldValue: string) => {
    if (newValue.trim() === "") {
      return oldValue; // Revert to old value if new value is invalid
    }
    return newValue;
  },
},
```

## Conclusion

Understanding these base concepts is crucial for mastering UECA. By focusing on encapsulation, modularity, and consistency, UECA provides a robust framework for developing scalable and maintainable web applications. This tutorial will guide you through the practical applications of these concepts, helping you build efficient and high-quality components.
