# Debug Logging in UECA-React

UECA-React provides a powerful logging system to help developers trace component behavior, track property changes, and debug application flow. By enabling debug mode, you gain insight into the inner workings of your components, making it easier to diagnose issues and verify functionality.

## Enabling Logging

To activate logging, set the debug flag in your browser’s console:

```javascript
componentModelDebug = true;
```

This enables detailed logs for all UECA components, output directly to the console. To disable logging, set `componentModelDebug = false`.

## Log Structure

Each log entry captures a specific event in the component lifecycle or state change. Common events include:

- **Model Creation**: When a new component model is instantiated.
- **Property Changes**: Updates to component properties.
- **Lifecycle Events**: Hooks like `init`, `mount`, `unmount`, `render`.
- **Hook Execution**: Start and end of component hooks (`FC begin/end hook`).

Every log entry includes:
- **Event Type**: The action being logged (e.g., `create model`, `change prop`).
- **Model ID**: A unique identifier for the component model (e.g., `model=#123456`).
- **Path**: The component’s hook name or its full path in the parent-child hierarchy (e.g., `useButton` or `app.ui.mainForm.button`).
- **Details**: Specifics like property values or changes (e.g., `"localhost"➝"127.0.0.1"`).

### Example Log

Here’s a sample log from editing a text input on a screen:

```plaintext
change prop model=#817544 path=app.ui.appRouter.appLayout.router.generalScreen.postgresHostInput[value] "localhost"➝"127.0.0.1"
render view model=#817544 path=app.ui.appRouter.appLayout.router.generalScreen.postgresHostInput
```

- The `value` property of `postgresHostInput` (`model=#817544`) changes from `"localhost"` to `"127.0.0.1"`.
- The component’s view is re-rendered to reflect the update.

Another example, showing a button initialization:

```plaintext
create model=#123456 path=useButton
init model=#123456 path=app.ui.mainForm.button
change prop model=#123456 path=app.ui.mainForm.button[caption] ""➝"Click Me"
render view model=#123456 path=app.ui.mainForm.button
```

- A button model is created and initialized.
- Its `caption` property is set, triggering a render.

## Benefits for Developers

- **Traceability**: Pinpoint exactly which component and property changed, using `model=#<id>` and `path`.  
- **Debugging Ease**: See the sequence of lifecycle events (`constr`, `init`, `mount`) to diagnose issues.  
- **State Clarity**: Track property updates to verify reactive behavior.  
- **Testing Support**: Combine with `model.fullId()` to map logs to specific components for automated tests.

## Reading the Log

To understand a log entry:
1. **Identify the Event**: Look at the action (`create model`, `change prop`, etc.).
2. **Check the Model ID**: Use `model=#<id>` to follow one component across events.
3. **Note the Path**: The `path` shows the component’s hook or its place in the app hierarchy.
4. **Review Details**: Property changes or lifecycle specifics reveal what happened.

For example:

```plaintext
change prop model=#817544 path=app.ui.appRouter.appLayout.router.generalScreen.postgresHostInput[value] "localhost"➝"127.0.0.1"
```

- **Event**: Property change (`change prop`).  
- **Model ID**: `#817544` (tracks `postgresHostInput`).  
- **Path**: Shows it’s an input field on the `generalScreen`.  
- **Details**: The `value` changed, likely from user input.

## Best Practices

1. **Enable Selectively**: Use `componentModelDebug = true` during development or debugging to avoid console clutter in production.
2. **Filter by Model ID**: Search logs for a specific `model=#<id>` to focus on one component.
3. **Combine with IDs**: Use `model.fullId()` (e.g., `app.ui.mainForm.button`) to map logs to your component hierarchy.
4. **Log Sparingly**: Disable logging (`componentModelDebug = false`) when not needed to improve performance.

With UECA’s logging, you’ll have a clear window into your app’s behavior, making development and debugging a breeze.
