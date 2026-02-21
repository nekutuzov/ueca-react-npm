# Tracing in UECA-React
#tracing #debug #log

Logging is a crucial part of debugging and monitoring your `ueca-react` application. The UECA framework provides a built-in logging mechanism that helps you trace component behavior, track property changes, and debug application flow. This section explains how to set up and use UECA logging effectively.

## Overview

UECA logging is designed to:
- Capture component lifecycle events.
- Log property changes and updates.
- Provide insights into the internal workings of your components.

By default, UECA uses the browser's `console` for output, but you can customize it to suit your needs.

## Setting Up Logging

To enable logging in `ueca-react`, you need to set the `traceLog` flag in the global settings. This can be done in your entry file (e.g., `index.tsx`):

```typescript
import * as UECA from "ueca-react";

// Enable logging
UECA.globalSettings.traceLog = true;
```

To disable logging, set `traceLog` to `false`:

```typescript
import * as UECA from "ueca-react";

// Disable logging
UECA.globalSettings.traceLog = false;
```

## Log Structure

When `traceLog` is enabled, UECA outputs detailed logs to the browser's console. Each log entry captures a specific event, such as:

- **Model Creation**: When a new component model is instantiated.
- **Property Changes**: Updates to component properties.
- **Lifecycle Events**: Hooks like `constr`, `init`, `mount`, `unmount`, `deinit`, `draw`, and `erase`.
- **Rendering**: When a component's view is rendered.

Every log entry includes:
- **Event Type**: The action being logged (e.g., `create model`, `change prop`).
- **Model ID**: A unique identifier for the component model (e.g., `model=#123456`).
- **Path**: The component’s hook name or its full path in the parent-child hierarchy (e.g., `useButton` or `app.ui.mainForm.button`).
- **Details**: Specifics like property values or changes (e.g., `"localhost"➝"127.0.0.1"`).

### Example Log

Here’s a sample log from changing a property in an input component:

```plaintext
change prop model=#817544 path=app.ui.appRouter.appLayout.router.generalScreen.postgresHostInput[value] "localhost"➝"127.0.0.1"
render view model=#817544 path=app.ui.appRouter.appLayout.router.generalScreen.postgresHostInput
```

- **Event**: Property change (`change prop`).
- **Model ID**: `#817544`.
- **Path**: `app.ui.appRouter.appLayout.router.generalScreen.postgresHostInput`.
- **Details**: The `value` property changed from `"localhost"` to `"127.0.0.1"`, triggering a re-render.

Another example, showing the creation and initialization of a button component:

```plaintext
create model=#123456 path=useButton
init model=#123456 path=app.ui.mainForm.button
change prop model=#123456 path=app.ui.mainForm.button[caption] ""➝"Click Me"
render view model=#123456 path=app.ui.mainForm.button
```

- **Events**: Model creation, initialization, property change, and rendering.
- **Model ID**: `#123456`.
- **Path**: Transitions from `useButton` to `app.ui.mainForm.button` as the component is integrated into the application hierarchy.

## Benefits for Developers

- **Traceability**: Easily track which component and property changed using `model=#<id>` and `path`.
- **Debugging Ease**: Observe the sequence of lifecycle events (`constr`, `init`, `mount`, etc.) to diagnose issues.
- **State Clarity**: Monitor property updates to verify reactive behavior.
- **Testing Support**: Combine with `model.fullId()` to map logs to specific components for automated tests.

## Reading the Log

To interpret a log entry:
1. **Identify the Event**: Determine the action (e.g., `change prop`).
2. **Check the Model ID**: Use `model=#<id>` to follow a specific component across events.
3. **Note the Path**: Understand the component’s location in the application hierarchy.
4. **Review Details**: See what changed or what action was performed.

For example:

```plaintext
change prop model=#817544 path=app.ui.appRouter.appLayout.router.generalScreen.postgresHostInput[value] "localhost"➝"127.0.0.1"
```

- **Event**: Property change.
- **Model ID**: `#817544`.
- **Path**: Indicates the component is an input field on the `generalScreen`.
- **Details**: The `value` property was updated, likely due to user input.

## Best Practices

- **Enable During Development**: Use `traceLog: true` during development or debugging to gain insights.
- **Disable in Production**: Set `traceLog: false` in production to avoid console clutter and improve performance.
- **Filter by Model ID**: Search logs for a specific `model=#<id>` to focus on one component.
- **Combine with Component IDs**: Use `model.fullId()` (e.g., `app.ui.mainForm.button`) to map logs to your component hierarchy.

With UECA’s tracing system, you can gain a clear window into your application’s behavior, making development and debugging more efficient.