# UECA-React Code Template

### TypeScript Code

```typescript
import * as UECA from "ueca-react";

// Component structure declaration. All sections (props, events, children, etc) are optional.
type MyCompStruct = UECA.ComponentStruct<{
    props: {
        // declaration of properties
    },

    events: {
        // declaration of events
    },

    children: {
        // declaration of children
    },

    methods: {
        // declaration of methods
    }
}>;

type MyCompParams = UECA.ComponentParams<MyCompStruct>; // component parameters type (props & events & hooks from MyCompStruct)
type MyCompModel = UECA.ComponentModel<MyCompStruct>;   // component model type

// Custom react hook. Returns component model.
function useMyComp(params?: MyCompParams): MyCompModel {
    const struct: MyCompStruct = {
        props: {
            // initialization of properties
            id: useMyComp.name
        },

        children: {
            // initialization of children
        },

        methods: {
            // initialization of methods
        },

        events: {
            // initialization of events
        },

        messages: {
            // initialization of listening messages
        },

        constr: () => { 
            // called once when the component model is created
        },

        init: () => { 
            // called after constr() when the model is first created or when it is retrieved from the cache
        },

        deinit: () => { 
            // called when the component loses its React context, making the model inactive (e.g., when it's cached but not in use)
        },

        mount: () => {
            // called when the component is mounted into React DOM
         },

        unmount: () => { 
            // called when the component is removed from React DOM
        },

        draw: () => { 
            // called when the component's view is rendered
        },

        erase: () => { 
            // called when the component's UI is about to be removed
        },

        // сomponent UI presentation
        View: () => <></>
    }

    // returns new component model or cached model (for subsequent calls)
    const model: MyCompModel = UECA.useComponent(struct, params);
    return model;

    // Private methods  
    function _somePrivateMethod() {
        
    }
}

// React functional component
const MyComp = UECA.getFC(useMyComp);

export { MyCompModel, useMyComp, MyComp }

```

### VisualCode Code Snippets
```json
"UECA-React Component": {
  "prefix": "ueca-component",
  "body": [
    "import * as UECA from \"ueca-react\";",
    "",
    "// Component structure declaration. All sections (props, events, children, etc) are optional.",
    "type ${1:MyComp}Struct = UECA.ComponentStruct<{",
    "    props: {",
    "        // declaration of properties",
    "    },",
    "",
    "    events: {",
    "        // declaration of events",
    "    },",
    "",
    "    children: {",
    "        // declaration of children",
    "    },",
    "",
    "    methods: {",
    "        // declaration of methods",
    "    }",
    "}>;",
    "",
    "type ${1:MyComp}Params = UECA.ComponentParams<${1:MyComp}Struct>; // component parameters type (props, events and hooks from ${1:MyComp}Struct)",
    "type ${1:MyComp}Model = UECA.ComponentModel<${1:MyComp}Struct>;   // component model type",
    "",
    "// Custom react hook. Returns component model.",
    "function use${1:MyComp}(params?: ${1:MyComp}Params): ${1:MyComp}Model {",
    "    const struct: ${1:MyComp}Struct = {",
    "        props: {",
    "            // initialization of properties",
    "            id: use${1:MyComp}.name",
    "        },",
    "",
    "        children: {",
    "            // initialization of children",
    "        },",
    "",
    "        methods: {",
    "            // initialization of methods",
    "        },",
    "",
    "        events: {",
    "            // initialization of events",
    "        },",
    "",
    "        messages: {",
    "            // initialization of listening messages",
    "        },",
    "",
    "        constr: () => { ",
    "            // called once when the component model is created",
    "        },",
    "",
    "        init: () => { ",
    "            // final initialization. called once for a newly created component model instance",
    "        },",
    "",
    "        mount: () => {",
    "            // called on component mounting to React DOM",
    "         },",
    "",
    "        unmount: () => { ",
    "            // called on component unmounting from React DOM",
    "        },",
    "",
    "        // Component UI presentation",
    "        View: () => <></>",
    "    }",
    "",
    "    //instantiate component model. return previously created model for subsequent calls.",
    "    const model: ${1:MyComp}Model = UECA.useComponent(struct, params);",
    "    return model;",
    "",
    "    // Private methods      ",
    "    function _somePrivateMethod() {",
    "",
    "    }",
    "}",
    "",
    "// React functional component",
    "const ${1:MyComp}= UECA.getFC(use${1:MyComp});",
    "",
    "export { ${1:MyComp}Model, use${1:MyComp}, ${1:MyComp} }",
    ""
  ],
  "description": "UECA-React Component"
}
```
