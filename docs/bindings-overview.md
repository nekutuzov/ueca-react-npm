# Bindings Overview

Unified Encapsulated Component Architecture (UECA) offers various binding mechanisms to manage state and interactions between components. Understanding these bindings is crucial for building efficient, maintainable, and scalable applications. This tutorial covers all types of bindings available in UECA.

## Types of Bindings in UECA

UECA supports three primary types of bindings:

1. **Unidirectional Binding**: Simplifies state management by ensuring the target property reflects the source property.
2. **Bidirectional Binding**: Synchronizes state between two properties, allowing changes to propagate in both directions.
3. **Custom Binding**: Provides flexibility to transform values during the binding process.

### 1. Unidirectional Binding

Unidirectional binding ensures that the value of a property in the source component is reflected in the target component. It is particularly useful for simple data flows where the target property should always match the source property.

#### Example

```typescript
// skip...

// Component structure declaration
type MyComponentStruct = UEC.ComponentStruct<{
  props: {  
      caption: string;      
  };
  children: {
      someInput: InputModel;
  }
}

// skip...

// Custom react hook. Returns component model.
function useMyComponent(params?: MyComponentParams): MyComponentModel {
  const struct: MyComponentStruct = {
    props: {
      // initialization of properties
      caption: "",      
    },

    children: {      
      // initialization of children
      someInput: useInput({            
        // Unidirectional binding (read-only).
        label: () => model.caption,            
      }),

// skip...          
```

In this example, `model.someInput.label` will always have the value of `model.caption`.

### 2. Bidirectional Binding

Bidirectional binding synchronizes state between two properties, allowing changes to propagate in both directions. This is useful when both components need to update each other.

#### Example


```typescript
// skip...

// Component structure declaration
type MyComponentStruct = UEC.ComponentStruct<{
  props: {  
    caption: string;      
    userName: { firstName?: string; lastName?: string };
  };
  children: {
    someInput: InputModel;        
  }
}

// skip...

// Custom react hook. Returns component model.
function useMyComponent(params?: MyComponentParams): MyComponentModel {
  const struct: MyComponentStruct = {
    props: {
      // initialization of properties
      caption: "",   
      userName: {},   
    },

    children: {      
      // initialization of children
      someInput: useInput({                        
        label: () => model.caption,    
        // Bidirectional binding (read-write).
        value: UEC.bindProp(() => model.userName, "firstName"),       
      }),

// skip...           
```
In this example, `model.userName.firstName` and `model.someInput.value` will always be in sync, reflecting changes made to either property.

### 3. Custom Binding

Custom binding provides the flexibility to transform values during the binding process. This is useful for cases where the displayed value and stored value need to be different or require specific formatting.

#### Example

In this example, we'll create a form component called `ContactForm` where the user enters their phone number. The phone number will be displayed in a formatted way (e.g., (123) 456-7890), but it will be stored in the model without formatting.

```typescript
// skip...

// Component structure declaration
type MyComponentStruct = UEC.ComponentStruct<{
  props: {  
    phoneNumber: string;
  };
  children: {
    phoneNumberInput: InputModel;       
  }
}

// skip...

// Custom react hook. Returns component model.
function useMyComponent(params?: MyComponentParams): MyComponentModel {
  const struct: MyComponentStruct = {
    props: {
      // initialization of properties
      phoneNumber: ""
    },

    children: {      
      // initialization of children
      phoneNumberInput: useMyInput({
        label: "Phone Number",
        // Custom binding
        value: UEC.bind(
          () => _formatPhoneNumber(model.phoneNumber),  // Display formatted phone number
          (value) => (model.phoneNumber = value.replace(/\D/g, ''))  // Store only digits
        ),        
      }),

// skip...

  // Private methods
  function _formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    // Match and format phone number
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phoneNumber;
  }
}

// skip...
```

**Custom Binding for Phone Number:**
   - **Getter Function**: `() => _formatPhoneNumber(model.phoneNumber)` ensures that the phone number is always displayed in a formatted way.
   - **Setter Function**: `(value) => (model.phoneNumber = value.replace(/\D/g, ''))` stores the phone number with only digits, removing any non-numeric characters.

### Summary

Understanding and leveraging different types of bindings in UECA can significantly enhance your application's flexibility, maintainability, and overall design. By using unidirectional, bidirectional, and custom bindings appropriately, you can create robust and scalable applications with ease.
