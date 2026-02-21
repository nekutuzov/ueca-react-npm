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
- Component extension supports unlimited hierarchy levels for complex libraries.  
- The `model` returned by `useExtendedComponent` includes both base and extended props/methods.  
- Set the `id` prop (e.g., `useInput.name`) for proper model caching and identification.  
- Errors in extended components are caught by `UECA.globalSettings.errorHandler`.  
- Event handlers like `onChange` chain with inherited handlers (e.g., `onChangeValue` from `EditControl`).