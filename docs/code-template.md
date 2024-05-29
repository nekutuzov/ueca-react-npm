# UECA Code Template

### TypeScript Code

```typescript
import * as React from "react";
import * as UEC from "ueca-react";

// Component structure declaration
type MyCompStruct = UEC.ComponentStruct<{
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

type MyCompParams = UEC.ComponentParams<MyCompStruct>; // component parameters type (props & events from Struct)
type MyCompModel = UEC.ComponentModel<MyCompStruct>;   // component model type

// Custom react hook. Returns component model.
function useMyComp(params?: MyCompParams): MyCompModel {
    const struct: MyCompStruct = {
        props: {
            // initialization of properties
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

        init: () => { 
            // final initialization. called once for a newly created component model instance
        },

        mount: () => {
            // called on component mounting to React DOM
         },

        unmount: () => { 
            // called on component unmounting from React DOM
        },

        // Component UI presentation
        View: () => null
    }

    //instantiate component model. return previously created model for subsequent calls.
    const model: MyCompModel = UEC.useComponent(struct, params);
    return model;

    // Private methods      
}

// React functional component
const MyComp = UEC.getFC(useMyComp);

export { MyCompModel, useMyComp, MyComp }

```

### VisualCode Code Snippets
```json
"UECA Component": {
  "prefix": "ueca-component",
  "body": [
    "import * as React from \"react\";",
    "import * as UEC from \"ueca-react\";",
    "",
    "// Component structure declaration",
    "type ${1:MyComp}Struct = UEC.ComponentStruct<{",
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
    "type ${1:MyComp}Params = UEC.ComponentParams<${1:MyComp}Struct>; // component parameters type (props & events from Struct)",
    "type ${1:MyComp}Model = UEC.ComponentModel<${1:MyComp}Struct>;   // component model type",
    "",
    "// Custom react hook. Returns component model.",
    "function use${1:MyComp}(params?: ${1:MyComp}Params): ${1:MyComp}Model {",
    "    const struct: ${1:MyComp}Struct = {",
    "        props: {",
    "            // initialization of properties",
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
    "        View: () => null",
    "    }",
    "",
    "    //instantiate component model. return previously created model for subsequent calls.",
    "    const model: ${1:MyComp}Model = UEC.useComponent(struct, params);",
    "    return model;",
    "",
    "    // Private methods      ",
    "}",
    "",
    "// React functional component",
    "const ${1:MyComp}= UEC.getFC(use${1:MyComp});",
    "",
    "export { ${1:MyComp}Model, use${1:MyComp}, ${1:MyComp} }",
    ""
  ],
  "description": "UECA Component"
}
```
