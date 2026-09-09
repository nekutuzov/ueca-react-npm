# Component Extension in UECA-React
#components #extension #inheritance #modularity #typescript

## Description
Component extension in UECA-React allows developers to create a hierarchy of components by inheriting functionality from a base component while adding or customizing features in derived components. This promotes code reuse, modularity, and maintainability, enabling the creation of reusable base library components (e.g., with validation or common props) that extended components inherit. The mechanism uses TypeScript generics for type safety and supports unlimited levels of inheritance, making it ideal for building scalable component libraries.

Key features:
- **Inheritance**: Derived components inherit props, methods, and events from the base component.
- **Type-Safe**: Leverages TypeScript generics for robust typing across the hierarchy.
- **Modular**: Facilitates reusable base components for common functionality.
- **Flexible**: Supports multi-level component hierarchies without restrictions.

---

## API/Methods

### Base Component Structure
- **BaseStruct**  
  Defines the common properties, methods, and events for the base component.  
  - **Example**: A base structure with validation logic, such as `EditControl` with props like `disabled` and methods like `validate`.

### Extending Components
- **UECA.ComponentStruct<T>**  
  A generic type that extends a base structure with additional properties, methods, or events.  
  - **Parameters**:  
    - `T`: The extended structure to merge with the base.  
  - **Usage**: Combines base and extended structures for type safety.

- **UECA.useExtendedComponent(baseStruct, extStruct, params, baseHook?)**  
  Creates a model that merges the base component’s structure with the extended structure.  
  - **Parameters**:  
    - `baseStruct`: The base component’s structure (e.g., validation logic).  
    - `extStruct`: The extended component’s structure (e.g., input-specific props).  
    - `params`: Optional parameters for initialization.  
    - `baseHook`: Optional base hook (defaults to `UECA.useComponent`).  
  - **Returns**: A model combining base and extended functionality.

### Rendering the Base UI
- **model.BaseView**  
  The **root** base component's `View`, rendered as an ordinary component: `<model.BaseView />`. This is what a two-level extension wants, and it is the same object as `model.BaseViews[0]`.

- **model.BaseViews**  
  Every base level's `View`, **root base first**, the component's own `View` excluded — one entry per level of the hierarchy. A three-level component has two entries: `BaseViews[0]` is the root base, `BaseViews[1]` is the level directly beneath it. `BaseViews.length` is the depth.  
  - **Usage**: JSX needs a capitalized binding, so index the array into a local first:

```typescript
View: () => {
    const RootUI = model.BaseViews[0];
    const ParentUI = model.BaseViews[model.BaseViews.length - 1];  // the level directly beneath
    return (
        <div id={model.htmlId()}>
            <ParentUI />
            <span>{model.caption}</span>
        </div>
    );
}
```

  Each entry is a stable component: render it, move it, or leave it out. Rendering the same level twice renders its UI twice — they are components, not slots.

---

## Code Examples

### Example 1: Base EditControl Component
This example defines a generic `EditControl<T>` base component that provides validation functionality and common properties.

```typescript
import * as UECA from "ueca-react";

type BaseStruct = UECA.ComponentStruct<{
  props: {
    disabled: boolean;
    readOnly: boolean;
    mandatory: boolean;
    style: React.CSSProperties;
    modelsToValidate: EditControlModel[];
    _internalValidationError: string;
  };
  methods: {
    getValidationError: () => string;
    validate: (errorText?: string) => Promise<void>;
    isValid: () => boolean;
    resetValidationErrors: () => void;
  };
  events: {
    onInternalValidate: () => Promise<string>;
    onValidate: () => Promise<string>;
  };
}>;

type EditControlStruct<T extends UECA.GeneralComponentStruct> = BaseStruct & UECA.ComponentStruct<T>;
type EditControlParams<T extends BaseStruct = EditControlStruct<{}>> = UECA.ComponentParams<T>;
type EditControlModel<T extends BaseStruct = BaseStruct> = UECA.ComponentModel<T>;

function useEditControl<T extends BaseStruct>(extStruct: T, params?: EditControlParams<T>): EditControlModel<T> {
  const struct: BaseStruct = {
    props: {
      disabled: false,
      readOnly: false,
      mandatory: false,
      style: undefined,
      modelsToValidate: [],
      _internalValidationError: undefined
    },
    methods: {
      getValidationError: () => {
        const errors: string[] = [];
        model.modelsToValidate?.forEach(x => {
          const err = x.getValidationError();
          err && errors.push(err);
        });
        model._internalValidationError && errors.push(model._internalValidationError);
        return errors.length && errors.join("\r\n") || undefined;
      },
      validate: async (errorText?: string) => {
        await Promise.all(model.modelsToValidate?.map(x => x.validate()));
        model._internalValidationError = await model.onInternalValidate?.();
        if (model._internalValidationError) return;
        model._internalValidationError = await model.onValidate?.();
        if (model._internalValidationError) return;
        model._internalValidationError = errorText;
      },
      isValid: () => !model.getValidationError(),
      resetValidationErrors: () => {
        model.modelsToValidate?.map(async x => x.resetValidationErrors());
        model._internalValidationError = undefined;
      }
    }
  };
  const model = UECA.useExtendedComponent(struct, extStruct, params);
  return model;
}

export { useEditControl, EditControlModel, EditControlStruct, EditControlParams };
```

- **Explanation**:  
  - Defines a base `EditControl` with validation-related props (`disabled`, `mandatory`), methods (`validate`, `isValid`), and events (`onInternalValidate`, `onValidate`).  
  - Uses generics (`T`) to allow extension with additional functionality.  
  - `UECA.useExtendedComponent` merges the base and extended structures.

### Example 2: Extended Input Component
This example extends `EditControl` to create an `Input` component with text input functionality and inherited validation.

```typescript
import { getFC } from "ueca-react";
import { Div, Input as RawInput } from "@components";
import { EditControlModel, EditControlParams, EditControlStruct, useEditControl } from "./EditControl";

type Struct = EditControlStruct<{
  props: {
    label: string;
    value: string;
    placeholder: string;
  };
  events: {
    onClick: () => void;
    onChange: (value: string, e: React.ChangeEvent<HTMLInputElement>) => void;
    onEnterKey: () => void;
  };
}>;

type InputParams = EditControlParams<Struct>;
type InputModel = EditControlModel<Struct>;

function useInput(params?: InputParams): InputModel {
  const struct: Struct = {
    props: {
      id: useInput.name,
      value: undefined,
      label: undefined,
      placeholder: undefined,
    },
    events: {
      onInternalValidate: async () => {
        if (model.mandatory && !model.value) {
          return `${model.label || "This field"} cannot be empty`;
        }
      },
      onChangeValue: () => model.resetValidationErrors()
    },
    View: () => (
      <Div id={model.htmlId()}>
        <RawInput
          value={model.value}
          placeholder={model.placeholder}
          label={model.label}
          mandatory={model.mandatory}
          disabled={model.disabled}
          readOnly={model.readOnly}
          validationError={model.getValidationError()}
          style={model.style}
          onChange={(value: string, e: React.ChangeEvent<HTMLInputElement>) => {
            model.value = value;
            model.onChange?.(value, e);
          }}
          onClick={() => model.onClick?.()}
          onEnterKey={() => model.onEnterKey?.()}
        />
      </Div>
    )
  };
  const model = useEditControl(struct, params);
  return model;
}

const Input = getFC(useInput);
export { InputModel, useInput, Input };
```

- **Explanation**:  
  - Extends `EditControl` to inherit validation props, methods, and events.  
  - Adds input-specific props (`value`, `label`, `placeholder`) and events (`onClick`, `onChange`, `onEnterKey`).  
  - Implements `onInternalValidate` for mandatory field validation.  
  - The `View` uses a `RawInput` component, leveraging inherited props.

### Example 3: Using the Input Component in a Form
This example shows the `Input` component in a form with a button to trigger validation.

```typescript
import * as UECA from "ueca-react";
import { useInput, InputModel } from "./Input";
import { ButtonModel, useButton } from "./Button";

type FormStruct = UECA.ComponentStruct<{
  props: {
    formValid: boolean
  };
  children: {
    nameInput: InputModel,
    okButton: ButtonModel,
  };
}>;

function useForm(): UECA.ComponentModel<FormStruct> {
  const struct: FormStruct = {
    props: {
      formValid: false
    },
    children: {
      nameInput: useInput({
        mandatory: true,
        label: "Name",
        onValidate: async () => {
          return model.nameInput.value ? undefined : "Name is required";
        },
        onChange: () => {
          model.nameInput.resetValidationErrors();
          model.formValid = true;
        }
      }),
      okButton: useButton({
        text: "OK",
        onClick: async () => {
          await model.nameInput.validate();
          model.formValid = model.nameInput.isValid();
        }
      }),
    },
    View: () => (
      <div>
        <model.nameInput.View />
        <model.okButton.View />
        <p>Form Valid: {model.formValid.toString()}</p>
      </div>
    ),
  };
  const model = UECA.useComponent(struct);
  return model;
}

const Form = UECA.getFC(useForm);
export { Form };
```

- **Explanation**:  
  - The `nameInput` inherits `EditControl`’s validation logic, with `onValidate` checking for empty input.  
  - The `onChange` event resets validation errors and sets `formValid` to `true`.  
  - The `okButton` triggers validation and updates `formValid`.

---

## Best Practices
- **Centralize Common Logic**: Place shared functionality (e.g., validation) in base components for reuse.  
- **Use TypeScript Generics**: Ensure type safety with `UECA.ComponentStruct<T>` for extensions.  
- **Keep Extensions Minimal**: Add only necessary props or methods to derived components.  
- **Leverage Inherited Methods**: Use base methods like `validate` for consistent behavior.
- **Chain Event Handlers**: Combine inherited events (e.g., `onChangeValue`) with custom handlers for flexibility.

---

## Notes
- Component extension supports unlimited hierarchy levels for complex libraries. Every level below a component is reachable through `model.BaseViews`, in order from the root base outwards.  
- The `model` returned by `useExtendedComponent` includes both base and extended props/methods.  
- Set the `id` prop (e.g., `useInput.name`) for proper model caching and identification.  
- Errors in extended components are caught by `UECA.globalSettings.errorHandler`.  

### Reading the base result: `model.$.__status.baseResult`

When a method or event exists in both halves, the base implementation runs **first** and its return value is
placed in `model.$.__status.baseResult` for the extension to read. This is the supported channel — it is the
one place application code is meant to reach into `model.$`:

```typescript
methods: {
    isValid: () => {
        if (model.disableValidation) {
            return true;                              // override the base entirely
        }
        return model.$.__status.baseResult as boolean; // or build on what the base decided
    }
}
```

The value is saved and restored around each call, so nesting works: at three levels, each extension sees the
level directly beneath it, not the root. An extension that ignores `baseResult` simply replaces the base
result with its own.

Whether the chain is synchronous or asynchronous is decided **at call time**, by whether the base returned a
`Promise`: a synchronous base yields a plain value, an asynchronous one yields a `Promise`. Before v2.0.6 a
chained function always returned a `Promise`.

### The order the two halves run in

| Members | Order |
| --- | --- |
| methods, and events other than the `onChanging` family | base first, then extension |
| `onPropChanging` and `onChanging<Prop>` | base first, then extension, with the base's returned value threaded in as the extension's `newValue` — so the two transformations compose |
| `constr`, `init`, `mount` | base first, then extension |
| `deinit`, `unmount`, `erase` | **extension first, then base** — teardown mirrors setup, so a level is torn down before the level it was built on |
| `draw` | base first, then extension |

`draw` and `erase` chain **synchronously**, unlike the other five hooks: they run from React's layout phase,
which is never awaited, so a handler returning a `Promise` is rejected with an error. See
[Lifecycle Hooks](Lifecycle%20Hooks%20in%20UECA-React.md).

A hook declared by only one of the two halves simply runs alone; the absent half contributes nothing.  
- Event handlers like `onChange` chain with inherited handlers (e.g., `onChangeValue` from `EditControl`).