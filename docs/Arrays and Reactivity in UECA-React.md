# Arrays and Reactivity in UECA-React

In UECA-React, arrays are a fundamental part of managing collections of data, such as lists of items in a user interface. UECA-React enhances arrays with reactivity, ensuring that changes to the array or its items can automatically trigger updates in the UI. This article explains how arrays work in UECA-React, their reactivity model, and the role of the `UECA.observe()` utility in making array items observable.

## Shallow Reactivity of Arrays

Arrays in UECA-React are **shallowly reactive**. This means that the array itself is reactive for operations that change its structure, such as adding or removing items. For example, methods like `push`, `pop`, `splice`, and direct index assignments (e.g., `array[0] = value`) are automatically detected, and the UI updates accordingly.

However, shallow reactivity only applies to the array's structure, not to the properties of the objects inside the array. If you modify a property of an object within the array (e.g., `array[0].property = newValue`), this change will **not** trigger a UI update unless the object itself is made observable.

### Example of Shallow Reactivity

Consider an array of tasks in a TODO list:

```typescript
const tasks = [
  { id: 1, description: 'Task 1', done: false },
  { id: 2, description: 'Task 2', done: true }
];
```

- **Reactive operations**: Adding a new task with `tasks.push({ id: 3, description: 'Task 3', done: false })` or removing a task with `tasks.splice(0, 1)` will trigger a UI update.
- **Non-reactive operations**: Changing a task's `done` status with `tasks[0].done = true` will **not** trigger a UI update because the task object is not observable.

## Making Array Items Observable with `UECA.observe()`

To make changes to the properties of array items reactive, you need to wrap each item with `UECA.observe()`. This utility function makes an object's properties observable, ensuring that any modifications to those properties trigger the necessary UI updates.

### Usage of `UECA.observe()`

When adding items to an array, wrap each item with `UECA.observe()` to make its properties reactive:

```typescript
const tasks = [
  UECA.observe({ id: 1, description: 'Task 1', done: false }),
  UECA.observe({ id: 2, description: 'Task 2', done: true })
];
```

Now, both structural changes to the array and property changes to the items will trigger UI updates:

- **Array-level reactivity**: `tasks.push(UECA.observe({ id: 3, description: 'Task 3', done: false }))` adds a new task and updates the UI.
- **Item-level reactivity**: `tasks[0].done = true` changes the `done` property of the first task and triggers a UI update because the task is observable.

### Why Use `UECA.observe()`?

- **Efficient updates**: By making array items observable, you ensure that only the affected parts of the UI re-render when a property changes, rather than re-rendering the entire list.
- **Simplified state management**: You can directly modify item properties without needing to create new copies of the array or use immutable update patterns.

## Code Example: Reactive TODO List

Below is an example of a TODO list that demonstrates how to use reactive arrays and observable items in UECA-React.

### Component Structure

```typescript
type Task = {
    taskId: number;
    description: string;
    done: boolean;
}

type TodoListStruct = UECA.ComponentStruct<{
    props: {
        newTask: string;
        tasks: Task[];
    };
    methods: {
        addTask: () => void;
        deleteTask: (taskId: number) => void;
        toggleTask: (taskId: number) => void;
        taskListView: () => JSX.Element;
    };
}>;
```

### Implementation

```typescript
function useTodoList(params?: TodoListParams): TodoListModel {
    const struct: TodoListStruct = {
        props: {
            id: useTodoList.name,
            newTask: "",
            tasks: []
        },
        methods: {
            addTask: () => {
                const newTaskName = model.newTask.trim();
                if (newTaskName) {
                    model.tasks.push(UECA.observe({
                        description: newTaskName,
                        done: false,
                        taskId: Math.round(Math.random() * 1000000)
                    }));
                    model.newTask = "";
                }
            },
            deleteTask: (taskId: number) => {
                model.tasks = model.tasks.filter(task => task.taskId !== taskId);
            },
            toggleTask: (taskId: number) => {
                const task = model.tasks.find(task => task.taskId === taskId);
                if (task) {
                    task.done = !task.done;  // Directly mutate the observable task
                }
            },
            taskListView: () => (
                <ul>
                    {model.tasks.map(task => (
                        <li key={task.taskId}>
                            <TodoItem
                                id={`task${task.taskId}`}
                                task={task}
                                onDelete={() => model.deleteTask(task.taskId)}
                                onToggle={() => model.toggleTask(task.taskId)}
                            />
                        </li>
                    ))}
                </ul>
            )
        },
        View: () => (
            <div id={model.htmlId()}>
                <div>
                    <input
                        type="text"
                        value={model.newTask}
                        onChange={(e) => (model.newTask = e.target.value)}
                        placeholder="New task"
                    />
                    <button onClick={model.addTask}>Add</button>
                </div>
                <model.taskListView />
            </div>
        )
    };
    const model = UECA.useComponent(struct, params);
    return model;
}
```

### Explanation

- **Adding a task**: When a new task is added, it is wrapped with `UECA.observe()` to make its properties (`description`, `done`) reactive.
- **Toggling a task**: The `toggleTask` method directly mutates the `done` property of the observable task, triggering a UI update for that specific task.
- **Deleting a task**: The `deleteTask` method filters the array, removing the task and updating the UI due to the array's shallow reactivity.

## Best Practices

- **Use `UECA.observe()` for item-level reactivity**: Apply it to array items when you need to track changes to their properties.
- **Avoid unnecessary observability**: If you only need to track structural changes to the array (e.g., adding/removing items), you can skip `UECA.observe()` for the items.
- **Performance considerations**: For large arrays or frequent updates, be mindful of the performance impact of making many items observable. Test and optimize as needed.
- **Keep the main `View` simple**: Use methods like `taskListView` to handle complex rendering logic, keeping the main `View` clean and focused.

## Conclusion

In UECA-React, arrays are shallowly reactive, meaning changes to the array's structure automatically trigger UI updates. However, to make changes to the properties of array items reactive, you must wrap those items with `UECA.observe()`. This approach ensures efficient and targeted UI updates, simplifying state management and improving performance. By understanding and applying these concepts, developers can build dynamic and responsive applications with ease.