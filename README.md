![logo](./docs/logo.png)
# UECA-React

> **⚠️ NOTICE: This is a test publication for early testing and feedback. The API may change before the stable release. Not recommended for production use yet.**

UECA-React is a framework for building scalable React applications with a unified and encapsulated component architecture. It simplifies development by hiding the complexities of React and MobX behind a consistent component pattern.

## Installation

To install UECA-React, run the following command:

```bash
npm install ueca-react
```

Ensure that your project also has the following dependencies installed:

- react
- react-dom
- mobx
- mobx-react

Compatible React versions: 16.8.0–19.1.0. Make sure your react-dom version matches your react version.

## Usage

Here's a simple example of a UECA component:

```typescript
import * as UECA from "ueca-react";

type ButtonStruct = UECA.ComponentStruct<{
    props: { 
        caption: string;
        disabled: boolean;
    };

    events: {
        onClick: () => void;
    };
}>;

type ButtonParams = UECA.ComponentParams<ButtonStruct>;
type ButtonModel = UECA.ComponentModel<ButtonStruct>;

function useButton(params?: ButtonParams): ButtonModel {
    const struct: ButtonStruct = {
        props: {            
            caption: "MyButton",
            disabled: false
        },

        events: {
            onChangeDisabled: (value) => {
                console.log(`Button id=${model.fullId()} disabled=${value}`);
            }
        },

        View: () => (
            <button id={model.htmlId()} disabled={model.disabled} onClick={() => model.onClick?.()}>
                {model.caption}
            </button>
        )
    };

    const model = UECA.useComponent(struct, params);
    return model;
}

const Button = UECA.getFC(useButton);
export { ButtonModel, useButton, Button };
```

For more detailed information, check out the [full documentation](./docs/index.md).

## Features

- **Unified Component Pattern**: Consistent structure for all components
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **MobX Integration**: Automatic reactivity without manual state management
- **Automatic onChange Events**: Auto-generated event handlers for every property (e.g., `onChangeCaption` for `caption` prop)
- **Lifecycle Hooks**: Built-in lifecycle management (constr, init, mount, draw, erase, unmount, deinit)
- **Message Bus**: Decoupled inter-component communication
- **Property Bindings**: Bidirectional data binding between components
- **AI-Friendly**: Designed for easy code generation and AI assistance

## Documentation

Comprehensive documentation is available in the [docs](./docs) folder:
- [Introduction to UECA-React](./docs/Introduction%20to%20UECA-React.md)
- [Component Guide](./docs/Introduction%20to%20UECA-React%20Components.md)
- [State Management](./docs/State%20Management%20in%20UECA-React.md)
- [Message Bus](./docs/Message%20Bus%20in%20UECA-React.md)
- [Lifecycle Hooks](./docs/Lifecycle%20Hooks%20in%20UECA-React.md)
- [Property Bindings](./docs/Property%20Bindings%20in%20UECA-React.md)

## Support

For questions, issues, or feature requests, please use the [GitHub issue tracker](https://github.com/nekutuzov/ueca-react-npm/issues).

## License

This project is licensed under the ISC License - see the [LICENSE](./LICENSE) file for details.

## Author

**Aleksey Suvorov**  
Email: cranesoft@protonmail.com  
GitHub: [nekutuzov/ueca-react-npm](https://github.com/nekutuzov/ueca-react-npm)