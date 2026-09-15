![logo](./logo.png)

# UECA-React Documentation

**UECA-React** is a TypeScript framework that gives every React component in an application the same shape —
a declarative `struct`, a model hook, and a functional component — and hides React and MobX behind it. It is
distributed as the `ueca-react` npm package and has no runtime dependencies of its own; React, React-DOM,
MobX and mobx-react are peer dependencies.

This folder holds the **programming guide**: how to build applications with the framework. The architecture
and development sets, which describe how the library itself is built and cite its source line by line, stay
in the development repository — they document code this package does not ship.

---

## UECA-React Programming Guide

The task-oriented guide for writing applications with UECA-React. It was written for the 2.x line and
remains accurate for 3.x; what 3.0 added and changed is in [`CHANGELOG.md`](../../CHANGELOG.md), and the
agent skills in [`skills/`](../../skills) carry the same material as instructions for an AI assistant.

1. [Introduction](original/Introduction%20to%20UECA-React.md)
2. [Technology](original/Technology%20of%20UECA-React.md)
3. [Component Mental Model](original/Component%20Mental%20Model%20in%20UECA-React.md)
4. [Component Integration Model](original/Component%20Integration%20Model%20in%20UECA-React.md)
5. [Introduction to Components](original/Introduction%20to%20UECA-React%20Components.md)
6. [Component IDs](original/Component%20IDs%20in%20UECA-React.md)
7. [Lifecycle Hooks](original/Lifecycle%20Hooks%20in%20UECA-React.md)
8. [State Management](original/State%20Management%20in%20UECA-React.md)
9. [Property Bindings](original/Property%20Bindings%20in%20UECA-React.md)
10. [Automatic onChange\<Prop> Events](original/Automatic%20onChange%20Events%20in%20UECA-React.md)
11. [Automatic onChanging\<Prop> Events](original/Automatic%20onChanging%20Events%20in%20UECA-React.md)
12. [Automatic onPropChange and onPropChanging Events](original/Automatic%20onPropChange%20and%20onPropChanging%20Events%20in%20UECA-React.md)
13. [Message Bus](original/Message%20Bus%20in%20UECA-React.md)
14. [Arrays and Reactivity](original/Arrays%20and%20Reactivity%20in%20UECA-React.md)
15. [Model Caching](original/Model%20Caching%20in%20UECA-React.md)
16. [Component Extension](original/Component%20Extension%20in%20UECA-React.md)
17. [Specialized Component Factories](original/Specialized%20Component%20Factories%20in%20UECA-React.md)
18. [Tracing](original/Tracing%20in%20UECA-React.md)
19. [Error Handling](original/Error%20Handling%20in%20UECA-React.md)
20. [Utility Functions](original/Utility%20Functions%20in%20UECA-React.md)
21. [Standard Code Template](original/code-template.md)

---

## Tools

[`docs/tools/trace-viewer.html`](../tools/trace-viewer.html) is the trace viewer as a standalone page. Open
it from disk and drop a trace saved by `UECA.trace.save()` on it to read the run as a table, a timeline, a
sequence, a tree or a graph — no application and no build required. The same viewer is embedded in the
library and mounts in place through `<UECA.TraceViewer/>` and `<UECA.TraceViewerButton/>`; see
[Tracing](original/Tracing%20in%20UECA-React.md).

---

## Live demos

Complete working applications built with UECA-React, developed with AI agents — GitHub Copilot at first,
Claude Code since (`README.md`, "Live Demos"):

- **Showcase** — [demo](https://nekutuzov.github.io/ueca-react-app-demo2/) ·
  [source](https://github.com/nekutuzov/ueca-react-app-demo2)
- **API documentation site** — [site](https://nekutuzov.github.io/ueca-react-doc/) ·
  [source](https://github.com/nekutuzov/ueca-react-doc)
- **MUI components** — [demo](https://nekutuzov.github.io/ueca-react-app-demo1/) ·
  [source](https://github.com/nekutuzov/ueca-react-app-demo1)

---

Package version 3.0.3 — see [`CHANGELOG.md`](../../CHANGELOG.md), "v3.0.3".
