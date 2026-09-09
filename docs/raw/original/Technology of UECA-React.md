# Technology of UECA-React

Unified Encapsulated Component Architecture (UECA) for React development leverages a blend of modern web technologies to create scalable, maintainable, and modular applications. Below is a summary of the key technologies and coding practices employed in UECA-React development:

## TypeScript

- **Core Language**: TypeScript is the primary language used for UECA-React development. It provides static typing, which enhances code quality and maintainability.
- **General Usage**: Most of the UECA-React code is written in general TypeScript, focusing on type safety and modern JavaScript features.
- **`strictNullChecks: false` is the premise for application code.** Every model property accepts `undefined` by design: a struct may seed only some of its properties, may seed `undefined`, and a bound property holds `undefined` until its binding is armed. `strictNullChecks` cannot tell a seeded property from an unseeded one, so with the flag on it demands a narrowing at every model read — `model.count ?? 0`, `model.items?.push(x)` — including the many places where the struct seeded a value a line earlier. That is noise, not safety: the code still runs as JavaScript, and a value from JSON, the DOM or another component can be `undefined` whatever the type says. UECA applications are therefore written and tested with `strictNullChecks: false` (keep `strict: true` and override this one flag), and the developer keeps the actual safeguard in mind: any value can be `undefined`, so read with reasonable care (`model.userName?.firstName`, a guard before a write). A project that keeps the flag on gets correct types from the library — the declarations are built strict — at the cost of that narrowing on every read.

## JSX

- **User Interface**: JSX is used to describe the UI in a syntax familiar to both JavaScript and HTML, making it easier to build and understand component structures.
- **Integration with TypeScript**: Combined with TypeScript, JSX allows for type-checked components, reducing runtime errors and improving development efficiency.

## React

- **Minimal Usage**: The only React feature utilized in UECA-React is custom hooks for component model instantiation. This minimizes the reliance on React-specific code and simplifies the learning curve for developers new to React.
- **Custom Hooks**: Custom hooks are used to instantiate and manage the lifecycle of component models, integrating React’s state and effect management seamlessly into UECA.

## Coding Techniques
- **Property Bindings**: Synchronizes state between components and their properties automatically, reducing the need for manual updates.
- **Automatic OnChange\<Property> Events**: Automatically triggers events when a property changes, allowing components to react to updates or intercept changes for validation.
- **Component Lifecycle Hooks**:
Manages creation, initialization, deinitialization, mounting, and unmounting of components, ensuring predictable behavior and proper resource management.
- **Interaction via Message Bus**:
Facilitates decoupled communication between components, promoting a modular architecture by allowing components to interact without direct dependencies.

## Coding Style

- **Declarative and Modular Approach**: The UECA-React code style emphasizes a declarative and modular approach, focusing on consistency, encapsulation, and readability to create maintainable and scalable component-based applications.
- **Utility Classes**: While the procedural approach is preferred, utility classes can be used where appropriate, particularly for reusable functions and routines.

## Standard Code Template

- **Consistency**: To maintain consistency across different components, developers are encouraged to use a [standard code template](code-template.md) for creating new components. This ensures that all components have a uniform structure, making the codebase easier to navigate and understand.
- **Structural Similarity**: Keeping the code structurally similar from component to component helps in maintaining readability and reducing the cognitive load on developers when switching between different parts of the application.

## React and TypeScript

- **Web Application Foundation**: A typical UECA-React application is a web application built using React and TypeScript. React provides the component-based architecture, while TypeScript offers strong typing and modern JavaScript features.
- **Ban on Other React Features**: Besides custom hooks, other React features (like class components, useState, useEffect) are banned from the application code to simplify the architecture and make the codebase more approachable for developers with a TypeScript background.

## Conclusion

UECA-React development emphasizes the use of TypeScript and JSX, with minimal reliance on React-specific features. By focusing on a declarative and modular approach and maintaining structural consistency, UECA-React aims to create maintainable and scalable web applications that are easy to understand and develop. Developers familiar with TypeScript and JSX can quickly adapt to UECA, even without extensive experience in React.
