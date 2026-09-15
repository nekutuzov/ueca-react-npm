![logo](./docs/raw/logo.png)
# UECA-React

[![npm version](https://img.shields.io/npm/v/ueca-react.svg)](https://www.npmjs.com/package/ueca-react)
[![AI agents: skills included](https://img.shields.io/badge/AI%20agents-skills%20included-8a2be2.svg)](#built-for-ai-agents)
[![license](https://img.shields.io/npm/l/ueca-react.svg)](./LICENSE)
[![runtime dependencies](https://img.shields.io/badge/runtime%20dependencies-0-brightgreen.svg)](./package.json)
[![react](https://img.shields.io/badge/react-16%20%E2%80%93%2019-61dafb.svg)](https://react.dev)

**The React framework for applications that AI agents write and people verify.**

UECA-React is a framework for building scalable React applications with a unified and encapsulated component
architecture. It simplifies development by hiding the complexities of React and MobX behind a consistent
component pattern. The framework is designed specifically for AI code generation and human verification: it
ships the agent skills that teach an assistant the pattern, and a trace viewer that shows you what the
generated application actually does.

## Built for AI agents

UECA-React is built for projects where AI agents write the code and people stay in control of it — a web
application or a site alike.

- **One shape to generate, one shape to review.** Every component is the same three declarations — a
  `struct`, a model hook and a functional component — with the struct's sections in one documented order.
  An agent that has seen one component has seen the pattern, and a reviewer checks the same short list on
  every file.
- **The instructions ship in the package.** [`skills/`](./skills) holds two agent skills:
  [`ueca-app-development`](./skills/ueca-app-development) for writing components — the pattern, state and
  bindings, lifecycle, model caching, the message bus — and
  [`ueca-app-architecture`](./skills/ueca-app-architecture) for a whole application — a complete barebone
  app to scaffold from, where each concern belongs, and a staged plan for migrating an existing React app.
  They describe the published API only, so they hold for any project.
- **Mistakes are loud, or written down.** Mistakes the framework detects throw and reach
  `globalSettings.errorHandler`, rather than being logged and dropped. The ones that fail silently are
  listed by symptom in the skills, so an agent looks the cause up instead of guessing.
- **You can see what was built.** The [trace viewer](#tracing-and-the-trace-viewer) draws the running
  application — its components, its message bus and its bindings — and `UECA.trace` saves the same record
  as JSON or as a Mermaid diagram for an agent to read.
- **The demos are built this way.** All three [live demos](#live-demos) are developed with AI agents,
  each working from a `CLAUDE.md` and the two skills.

Give your agent the skills — `.claude/skills/` is where Claude Code looks:

```bash
cp -r node_modules/ueca-react/skills/* .claude/skills/
```

[`skills/README.md`](./skills/README.md) covers symlinking, a `postinstall` hook that keeps the skills in
step with the version you have installed, and the lines to add to your project's `CLAUDE.md`.

## What's new in 3.0

<!-- The absolute raw URL is deliberate: npm and GitHub resolve relative paths differently, and
     raw.githubusercontent.com serves the public repository. The file lives in media/, never under docs/,
     because docs/ ships in the npm tarball. It renders once media/ is in the public repo. -->
<img src="https://raw.githubusercontent.com/nekutuzov/ueca-react-npm/master/media/ueca-trace-viewer.gif"
     alt="The UECA trace viewer: the component graph of a running application, with the message bus and binding wiring drawn on it, replaying a recorded trace" width="900">

**That is not a mock-up — go press the button yourself.** All three [live demos](#live-demos) ship
`<UECA.TraceViewerButton/>` in the corner. Open one, click it, and the viewer above opens on the
application you are looking at, with its own trace in it. Each demo's source sits next to its link.

- **A visual Trace Viewer, in the box.** Drop `<UECA.TraceViewerButton/>` at the root of an application and
  watch it run — the component tree, the message bus and every binding, live. See below.
- **Every mistake is reported.** Assignments that used to be logged and dropped now throw, and reach
  `globalSettings.errorHandler`.
- **`React.StrictMode` is supported** — and the leak it exposed is fixed for everyone else too.
- **Bindings converge, or say why they cannot.** An `onChanging` rewrite now reaches the far end of a
  chain, and arrays sync in place at roughly twice the speed.
- **The framework's own agent instructions ship with it.** `skills/` carries the component pattern and the
  whole-application architecture, so an AI assistant working in your project follows them instead of
  guessing at them. See [Built for AI agents](#built-for-ai-agents).
- **This release has breaking changes.** See [Upgrading from 2.x](#upgrading-from-2x) and the
  [changelog](./CHANGELOG.md).

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

Compatible React versions: 16–19. Make sure your react-dom version matches your react version.

## Quick start

Every UECA component is the same three declarations — a `struct`, a model hook, and a functional component:

```tsx
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
            // `id` comes first: it drives the DOM id, the full path, bus addressing and the model cache.
            id: useButton.name,
            caption: "",
            disabled: false
        },

        events: {
            onClick: () => {
                console.log(`${model.fullId()} clicked`);
            },

            // Generated for every property, with no declaration needed.
            onChangeDisabled: (value) => {
                console.log(`${model.fullId()} disabled=${value}`);
            }
        },

        View: () => (
            <button 
                id={model.htmlId()}
                disabled={model.disabled}
                onClick={() => model.onClick?.()}
            >
                {model.caption}
            </button>
        )
    };

    // Declared after the struct, which closes over it. Later calls return the same model.
    const model = UECA.useComponent(struct, params);
    return model;
}

const Button = UECA.getFC(useButton);

export { type ButtonModel, useButton, Button };
```

Use it as a component, or drive it through its model:

```tsx
<Button 
    caption="Save"
    disabled={false}
    onClick={() => save()}
/>
```

For more detailed information, check out the [full documentation](https://nekutuzov.github.io/ueca-react-doc/).

## Tracing and the Trace Viewer

Every model creation, lifecycle hook, render, property change, binding sync, cache decision and bus message
is a structured trace record. The viewer ships with the library and reads them live.

```tsx
// A button pinned to a screen corner, opening the viewer over your application:
<UECA.TraceViewerButton/>

// ...or the panel embedded wherever you want it:
<UECA.TraceViewer height={600}/>
```

Both are development tools, and a closed viewer costs nothing — the viewer page is a separate chunk that is
downloaded only when it is opened.

Five views over one trace:

| View | What it shows |
| --- | --- |
| **Table** | every record, filterable by kind, component and text; click one for the full detail |
| **Timeline** | when things happened, and what happened together |
| **Sequence** | messages and calls between components, as a sequence diagram |
| **Tree** | the component hierarchy the trace built |
| **Graph** | the component tree with the message bus and binding wiring drawn on it — and the trace played through it |

You do not need any UI at all:

```tsx
UECA.globalSettings.tracing = { capture: 5000 };  // record silently, even with the console quiet
UECA.trace.records();                             // everything captured
UECA.trace.save("trace.json");                    // reopen it in the viewer
UECA.trace.save("flow.mmd");                      // ...or write a Mermaid sequence diagram
```

`window.UECA` *is* `globalSettings`, so `window.UECA.trace.save()` works from a devtools console with
nothing imported and no rebuild.

## Features

- **Built for AI Agents**: One pattern to generate and to review, with the agent skills in the package
- **Unified Component Pattern**: Consistent structure for all components
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **MobX Integration**: Automatic reactivity without manual state management
- **Automatic onChange Events**: Auto-generated event handlers for every property (e.g., `onChangeCaption` for `caption` prop)
- **Lifecycle Hooks**: Built-in lifecycle management — in through `constr → init → draw → mount`, out through `erase → unmount → deinit`
- **Message Bus**: Decoupled inter-component communication
- **Property Bindings**: Bidirectional data binding between components
- **Tracing and the Trace Viewer**: A structured trace of everything the framework does, and a viewer for it
- **Error Containment**: A failing view is contained to its own component, and errors reach one handler

## Upgrading from 2.x

3.0 is a breaking release. The short list — the [changelog](./CHANGELOG.md) has the detail:

- Mistakes that used to be logged now **throw**: assigning a non-function to an event, assigning to a
  declared method or child model, a binding passed for `cacheable`, two siblings claiming one `id`, and a
  parameter that switches between a binding and a value.
- `unicast` and `castTo` **throw before dispatching** when more than one subscriber matches.
- A message that declares no payload now takes **no argument** — `unicast("Msg", undefined)` is a compile
  error, `unicast("Msg")` is correct.
- `draw` and `erase` must be **synchronous**.
- A `children`-section constant is an initial value and is **no longer re-asserted** when a cached model
  remounts. A JSX prop still is.
- `id` and `cacheable` no longer accept a binding, and no longer generate `onChange`/`onChanging` events.
- `hashHtmlId` is read from `globalSettings`, not from `window`.

## Live Demos

See UECA-React in action in complete working applications, developed with AI agents — GitHub Copilot at
first, Claude Code since.

Every one of them ships `<UECA.TraceViewerButton/>`: the button in the corner opens the
[trace viewer](#tracing-and-the-trace-viewer) on the running application, so you can watch the component
tree, the message bus and the bindings of code you can read in the same tab.

**🔗 Demo 1:** [Showcase](https://nekutuzov.github.io/ueca-react-app-demo2/)  
**📂 Source Code:** [GitHub Repository](https://github.com/nekutuzov/ueca-react-app-demo2)

**🔗 Demo 2:** [UECA-React API Documentation](https://nekutuzov.github.io/ueca-react-doc/)  
**📂 Source Code:** [GitHub Repository](https://github.com/nekutuzov/ueca-react-doc)

**🔗 Demo 3:** [MUI Components](https://nekutuzov.github.io/ueca-react-app-demo1/)  
**📂 Source Code:** [GitHub Repository](https://github.com/nekutuzov/ueca-react-app-demo1)

## API Documentation

Comprehensive [API Documentation](https://nekutuzov.github.io/ueca-react-doc/) is also available, and the
package ships the programming guide in the [docs](./docs) folder.

The guide:
- [Introduction to UECA-React](./docs/raw/original/Introduction%20to%20UECA-React.md)
- [Component Guide](./docs/raw/original/Introduction%20to%20UECA-React%20Components.md)
- [State Management](./docs/raw/original/State%20Management%20in%20UECA-React.md)
- [Message Bus](./docs/raw/original/Message%20Bus%20in%20UECA-React.md)
- [Lifecycle Hooks](./docs/raw/original/Lifecycle%20Hooks%20in%20UECA-React.md)
- [Property Bindings](./docs/raw/original/Property%20Bindings%20in%20UECA-React.md)
- [Tracing](./docs/raw/original/Tracing%20in%20UECA-React.md)

[`docs/raw/index.md`](./docs/raw/index.md) is the contents page, and
[`docs/tools/trace-viewer.html`](./docs/tools/trace-viewer.html) reads a saved trace with no application
running. The agent skills are in [`skills/`](./skills) — see [Built for AI agents](#built-for-ai-agents).

## Support

For questions, issues, or feature requests, please use the [GitHub issue tracker](https://github.com/nekutuzov/ueca-react-npm/issues).

## License

This project is licensed under the ISC License - see the [LICENSE](./LICENSE) file for details.

## Author

**Aleksey Suvorov**  
Email: cranesoft@protonmail.com  
Website: [cranesoft.net](https://cranesoft.net)  
GitHub: [nekutuzov](https://github.com/nekutuzov)  
Npm: [nekutuzov](https://www.npmjs.com/~nekutuzov)
