# The barebone application

A complete, runnable pure-UECA application. Write these files in this order — each depends only on the
ones above it. Nothing here is decoration: remove a piece and something above it stops working.

Adjust names and styling freely. Do **not** restructure the layers — that is the architecture.

## Prerequisites

```bash
npm install ueca-react react react-dom mobx mobx-react
```

`react-dom` must be on the same major as `react`. React 16.8 – 19 are supported; the bootstrap below
uses the React 18+ `createRoot`.

## File manifest

```
src/
  main.tsx                          entry point
  core/
    appMessage.ts                   the message contract  ← write first
    appStart.tsx                    the React bootstrap
    application.tsx                 root model
    appUI.tsx                       the shell
    appRouter.tsx                   route → screen
    appRoutes.tsx                   the route table
    appLayout.tsx                   chrome: top bar, menu, content slot
    appDialogManager.tsx            service — dialogs
    appBusyDisplay.tsx              service — busy overlay
    screenLayout.tsx                the frame every screen uses
    index.ts                        barrel
  components/
    base/
      base.tsx                      useBase       — shorthand methods, no UI
      uiBase.tsx                    useUIBase     — visual
      editBase.tsx                  useEditBase   — validation
      screenBase.tsx                useScreenBase — route-mounted
    index.ts                        barrel
  api/
    apiService.tsx                  service — the only place that talks to the server
    index.ts                        barrel
  screens/
    homeScreen.tsx                  the pattern every later screen copies
    index.ts                        barrel
```

---

## 1 · `src/core/appMessage.ts`

The app's public wiring. Every message anything sends is declared here, and nothing sends a message
that is not. Write it first, and add to it before writing the code that uses an entry.

```ts
import * as UECA from "ueca-react";

// "message-id": { in: <payload type>, out: <result type> } — both optional.
type AppMessage = {
    // Application
    "App.UnhandledException": { in: Error };
    "App.GetInfo": { out: { appName: string } };

    // UI services
    "UI.Dialog.Info": { in: { title: string; message: string } };
    "UI.Dialog.YesNo": { in: { title: string; message: string }; out: boolean };
    "UI.Busy.Set": { in: boolean };

    // Navigation
    "Nav.GoTo": { in: string; out: boolean };
    "Nav.Current": { out: string };

    // Server — one entry per operation, named after the endpoint
    "Api.Get": { in: string; out: unknown };
    "Api.Post": { in: { path: string; body?: unknown }; out: unknown };
};

// For code that has no model of its own (the bootstrap, a plain module).
function appMessageBus() {
    return UECA.defaultMessageBus<AppMessage>();
}

export { type AppMessage, appMessageBus };
```

**Naming:** `Domain.Thing` — `Api.Site.GetList`, `UI.Screen.DisableControls`. A message with no `in`
takes no payload argument at the call site.

---

## 2 · The base chain

Four hooks, each extending the one below. This is the app's own component vocabulary, and the reason
no component ever imports the dialog manager.

### `src/components/base/base.tsx`

```tsx
import * as UECA from "ueca-react";
import { type AppMessage } from "../../core/appMessage";

// Base component for EVERYTHING in the application. No UI of its own — it exists so that any
// component can reach the app's services without importing them or knowing the message ids.
type BasePartialStruct = UECA.ComponentStruct<{
    methods: {
        dialogInfo: (title: string, message: string) => Promise<void>;
        dialogYesNo: (title: string, message: string) => Promise<boolean>;
        setAppBusy: (busy: boolean) => Promise<void>;
        goToRoute: (path: string) => Promise<boolean>;
        currentRoute: () => Promise<string>;
        // Shows the busy overlay for the duration of `action`, whatever it returns or throws.
        runWithBusyDisplay: <T>(action: () => Promise<T>) => Promise<T>;
    };
}, AppMessage>;

type BaseStruct<T extends UECA.GeneralComponentStruct> = BasePartialStruct & UECA.ComponentStruct<T, AppMessage>;
type BaseParams<T extends BasePartialStruct = BaseStruct<UECA.GeneralComponentStruct>> = UECA.ComponentParams<T, AppMessage>;
type BaseModel<T extends BasePartialStruct = BasePartialStruct> = UECA.ComponentModel<T, AppMessage>;

function useBase<T extends BasePartialStruct>(extStruct: T, params?: BaseParams<T>): BaseModel<T> {
    const struct: BasePartialStruct = {
        methods: {
            dialogInfo: async (title, message) => {
                await model.bus.unicast("UI.Dialog.Info", { title, message });
            },

            dialogYesNo: async (title, message) =>
                await model.bus.unicast("UI.Dialog.YesNo", { title, message }),

            setAppBusy: async (busy) => {
                await model.bus.unicast("UI.Busy.Set", busy);
            },

            goToRoute: async (path) => await model.bus.unicast("Nav.GoTo", path),

            currentRoute: async () => await model.bus.unicast("Nav.Current"),

            runWithBusyDisplay: async (action) => {
                await model.setAppBusy(true);
                try {
                    return await action();
                } finally {
                    await model.setAppBusy(false);
                }
            },
        },
    };

    const model = UECA.useExtendedComponent(struct, extStruct, params);
    return model;
}

export { type BaseStruct, type BaseParams, type BaseModel, useBase };
```

> These methods compile and run **before any service exists** — an unhandled message is not an error,
> `unicast` simply returns `undefined`. That is why the base chain comes before the services.

### `src/components/base/uiBase.tsx`

```tsx
import * as UECA from "ueca-react";
import { type BaseModel, type BaseParams, type BaseStruct, useBase } from "./base";

// Base for every component that draws something.
type UIBasePartialStruct = BaseStruct<{
    props: {
        extent: { width?: number | string; height?: number | string };
        className: string;
    };
}>;

type UIBaseStruct<T extends UECA.GeneralComponentStruct> = UIBasePartialStruct & BaseStruct<T>;
type UIBaseParams<T extends UIBasePartialStruct = UIBaseStruct<UECA.GeneralComponentStruct>> = BaseParams<T>;
type UIBaseModel<T extends UIBasePartialStruct = UIBasePartialStruct> = BaseModel<T>;

function useUIBase<T extends UIBasePartialStruct>(extStruct: T, params?: UIBaseParams<T>): UIBaseModel<T> {
    const struct: UIBasePartialStruct = {
        props: {
            extent: undefined,
            className: "",
        },
    };

    // The 4th argument is what chains this level onto useBase.
    const model = UECA.useExtendedComponent(struct, extStruct, params, useBase);
    return model;
}

export { type UIBaseStruct, type UIBaseParams, type UIBaseModel, useUIBase };
```

### `src/components/base/editBase.tsx`

```tsx
import * as UECA from "ueca-react";
import { type UIBaseModel, type UIBaseParams, type UIBaseStruct, useUIBase } from "./uiBase";

// Base for an editable ENTITY — a single field, or a form composed of fields. `modelsToValidate`
// aggregates child EditBases, so a form validates by listing its fields rather than owning a
// validator of its own.
type EditBasePartialStruct = UIBaseStruct<{
    props: {
        label: string;
        mandatory: boolean;
        readOnly: boolean;
        disabled: boolean;
        modelsToValidate: EditBaseModel[];
        _validationError: string;
    };

    methods: {
        validate: () => Promise<void>;
        isValid: () => boolean;
        getValidationError: () => string;
        resetValidation: () => void;
    };

    events: {
        // Return an error message to fail validation, or nothing to pass.
        onValidate: () => Promise<string | undefined>;
    };
}>;

type EditBaseStruct<T extends UECA.GeneralComponentStruct> = EditBasePartialStruct & UIBaseStruct<T>;
type EditBaseParams<T extends EditBasePartialStruct = EditBaseStruct<UECA.GeneralComponentStruct>> = UIBaseParams<T>;
type EditBaseModel<T extends EditBasePartialStruct = EditBasePartialStruct> = UIBaseModel<T>;

function useEditBase<T extends EditBasePartialStruct>(extStruct: T, params?: EditBaseParams<T>): EditBaseModel<T> {
    const struct: EditBasePartialStruct = {
        props: {
            label: "",
            mandatory: false,
            readOnly: false,
            disabled: false,
            modelsToValidate: [],
            _validationError: undefined,
        },

        methods: {
            validate: async () => {
                await Promise.all(model.modelsToValidate?.map((x) => x.validate()) ?? []);
                model._validationError = await model.onValidate?.();
            },

            isValid: () => !model.getValidationError(),

            getValidationError: () => {
                const errors: string[] = [];
                model.modelsToValidate?.forEach((x) => {
                    const err = x.getValidationError();
                    if (err) errors.push(err);
                });
                if (model._validationError) errors.push(model._validationError);
                return errors.length ? errors.join("\n") : undefined;
            },

            resetValidation: () => {
                model.modelsToValidate?.forEach((x) => x.resetValidation());
                model._validationError = undefined;
            },
        },
    };

    const model = UECA.useExtendedComponent(struct, extStruct, params, useUIBase);
    return model;
}

export { type EditBaseStruct, type EditBaseParams, type EditBaseModel, useEditBase };
```

### `src/components/base/screenBase.tsx`

```tsx
import * as UECA from "ueca-react";
import { type UIBaseModel, type UIBaseParams, type UIBaseStruct, useUIBase } from "./uiBase";

// Base for a route-mounted screen. The router passes `routeParams`.
type ScreenBasePartialStruct = UIBaseStruct<{
    props: {
        routeParams: Record<string, string>;
        title: string;
    };

    methods: {
        refresh: () => Promise<void>;
    };
}>;

type ScreenBaseStruct<T extends UECA.GeneralComponentStruct> = ScreenBasePartialStruct & UIBaseStruct<T>;
type ScreenBaseParams<T extends ScreenBasePartialStruct = ScreenBaseStruct<UECA.GeneralComponentStruct>> = UIBaseParams<T>;
type ScreenBaseModel<T extends ScreenBasePartialStruct = ScreenBasePartialStruct> = UIBaseModel<T>;

function useScreenBase<T extends ScreenBasePartialStruct>(extStruct: T, params?: ScreenBaseParams<T>): ScreenBaseModel<T> {
    const struct: ScreenBasePartialStruct = {
        props: {
            routeParams: {},
            title: "",
        },

        methods: {
            // Screens override this; the default is a no-op so a caller need not check.
            refresh: async () => { },
        },
    };

    const model = UECA.useExtendedComponent(struct, extStruct, params, useUIBase);
    return model;
}

export { type ScreenBaseStruct, type ScreenBaseParams, type ScreenBaseModel, useScreenBase };
```

### `src/components/index.ts`

```ts
export * from "./base/base";
export * from "./base/uiBase";
export * from "./base/editBase";
export * from "./base/screenBase";
```

---

## 3 · Services

Each is an ordinary component with `messages:` handlers. Two of them draw; the API service does not.

### `src/core/appBusyDisplay.tsx`

```tsx
import * as UECA from "ueca-react";
import { type UIBaseModel, type UIBaseParams, type UIBaseStruct, useUIBase } from "../components";

// Counts its calls, so two overlapping operations do not clear each other's overlay.
type AppBusyDisplayStruct = UIBaseStruct<{
    props: {
        busyCount: number;
    };
}>;

type AppBusyDisplayParams = UIBaseParams<AppBusyDisplayStruct>;
type AppBusyDisplayModel = UIBaseModel<AppBusyDisplayStruct>;

function useAppBusyDisplay(params?: AppBusyDisplayParams): AppBusyDisplayModel {
    const struct: AppBusyDisplayStruct = {
        props: {
            id: useAppBusyDisplay.name,
            busyCount: 0,
        },

        messages: {
            "UI.Busy.Set": async (busy) => {
                model.busyCount = Math.max(0, model.busyCount + (busy ? 1 : -1));
            },
        },

        View: () => {
            if (!model.busyCount) return null;
            return (
                <div
                    id={model.htmlId()}
                    className="app-busy"
                    role="progressbar"
                    aria-busy="true"
                >
                    <div className="app-busy-spinner" />
                </div>
            );
        },
    };

    const model = useUIBase(struct, params);
    return model;
}

const AppBusyDisplay = UECA.getFC(useAppBusyDisplay);

export { type AppBusyDisplayModel, useAppBusyDisplay, AppBusyDisplay };
```

### `src/core/appDialogManager.tsx`

```tsx
import * as UECA from "ueca-react";
import { type UIBaseModel, type UIBaseParams, type UIBaseStruct, useUIBase } from "../components";

// One dialog host for the whole app. A caller awaits `dialogYesNo(...)` from the base chain and
// never learns this component exists.
type AppDialogManagerStruct = UIBaseStruct<{
    props: {
        visible: boolean;
        title: string;
        message: string;
        showCancel: boolean;
        // Not observable: the promise resolver for the dialog currently open.
        __resolve: (result: boolean) => void;
    };

    methods: {
        close: (result: boolean) => void;
    };
}>;

type AppDialogManagerParams = UIBaseParams<AppDialogManagerStruct>;
type AppDialogManagerModel = UIBaseModel<AppDialogManagerStruct>;

function useAppDialogManager(params?: AppDialogManagerParams): AppDialogManagerModel {
    const struct: AppDialogManagerStruct = {
        props: {
            id: useAppDialogManager.name,
            visible: false,
            title: "",
            message: "",
            showCancel: false,
            __resolve: undefined,
        },

        methods: {
            close: (result) => {
                model.visible = false;
                const resolve = model.__resolve;
                model.__resolve = undefined;
                resolve?.(result);
            },
        },

        messages: {
            "UI.Dialog.Info": async (p) => {
                await _open(p.title, p.message, false);
            },

            "UI.Dialog.YesNo": async (p) => await _open(p.title, p.message, true),
        },

        View: () => {
            if (!model.visible) return null;
            return (
                <div
                    id={model.htmlId()}
                    className="app-dialog-backdrop"
                    role="dialog"
                    aria-modal="true"
                    aria-label={model.title}
                >
                    <div className="app-dialog">
                        <h2 className="app-dialog-title">{model.title}</h2>
                        <p className="app-dialog-message">{model.message}</p>
                        <div className="app-dialog-buttons">
                            {model.showCancel && (
                                <button
                                    id={model.htmlId() + "-cancel"}
                                    onClick={() => model.close(false)}
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                id={model.htmlId() + "-ok"}
                                onClick={() => model.close(true)}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            );
        },
    };

    const model = useUIBase(struct, params);
    return model;

    // Private methods
    function _open(title: string, message: string, showCancel: boolean): Promise<boolean> {
        model.title = title;
        model.message = message;
        model.showCancel = showCancel;
        model.visible = true;
        return new Promise<boolean>((resolve) => {
            model.__resolve = resolve;
        });
    }
}

const AppDialogManager = UECA.getFC(useAppDialogManager);

export { type AppDialogManagerModel, useAppDialogManager, AppDialogManager };
```

### `src/api/apiService.tsx`

```tsx
import * as UECA from "ueca-react";
import { type BaseModel, type BaseParams, type BaseStruct, useBase } from "../components";

// The ONLY place in the application that talks to the server. Screens send messages.
type ApiServiceStruct = BaseStruct<{
    props: {
        baseUrl: string;
    };
}>;

type ApiServiceParams = BaseParams<ApiServiceStruct>;
type ApiServiceModel = BaseModel<ApiServiceStruct>;

function useApiService(params?: ApiServiceParams): ApiServiceModel {
    const struct: ApiServiceStruct = {
        props: {
            id: useApiService.name,
            baseUrl: "/api",
        },

        messages: {
            "Api.Get": async (path) => await _request(path, "GET"),

            "Api.Post": async (p) => await _request(p.path, "POST", p.body),
        },

        View: () => null,
    };

    const model = useBase(struct, params);
    return model;

    // Private methods
    async function _request(path: string, method: string, body?: unknown): Promise<unknown> {
        const response = await fetch(model.baseUrl + path, {
            method,
            headers: { "Content-Type": "application/json" },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        if (!response.ok) {
            throw new Error(`${method} ${path} failed: ${response.status} ${response.statusText}`);
        }
        return response.status === 204 ? undefined : await response.json();
    }
}

const ApiService = UECA.getFC(useApiService);

export { type ApiServiceModel, useApiService, ApiService };
```

### `src/api/index.ts`

```ts
export * from "./apiService";
```

---

## 4 · Routing

### `src/core/appRoutes.tsx`

The route table. One entry per screen; the key is the URL pattern, the value builds the screen.

```tsx
import * as UECA from "ueca-react";
import { HomeScreen } from "../screens";

// ":name" captures a path segment. Patterns are tried in order, so put literals before patterns.
const appRoutes: Record<string, (params?: Record<string, string>) => UECA.ReactElement> = {
    "/": () => (
        <HomeScreen id="homeScreen" />
    ),
    "/items/:itemId": (p) => (
        <HomeScreen
            id={"homeScreen-" + p?.itemId}
            routeParams={p}
        />
    ),
};

export { appRoutes };
```

### `src/core/appRouter.tsx`

```tsx
import * as UECA from "ueca-react";
import { type UIBaseModel, type UIBaseParams, type UIBaseStruct, useUIBase } from "../components";
import { appRoutes } from "./appRoutes";

type AppRouterStruct = UIBaseStruct<{
    props: {
        path: string;
        // Not observable: the popstate listener, so `unmount` can detach the same function.
        __onPopState: () => void;
    };

    methods: {
        _ScreenView: () => UECA.ReactElement;
    };
}>;

type AppRouterParams = UIBaseParams<AppRouterStruct>;
type AppRouterModel = UIBaseModel<AppRouterStruct>;

function useAppRouter(params?: AppRouterParams): AppRouterModel {
    const struct: AppRouterStruct = {
        props: {
            id: useAppRouter.name,
            path: "/",
            __onPopState: undefined,
        },

        methods: {
            // A *View METHOD, not the View: it re-renders on a route change without the router's
            // own View running.
            _ScreenView: () => {
                const match = _match(model.path);
                if (!match) return <div className="app-route-missing">Not found: {model.path}</div>;
                return match.render(match.params);
            },
        },

        messages: {
            "Nav.GoTo": async (path) => {
                if (path !== model.path) {
                    window.history.pushState(null, "", path);
                    model.path = path;
                }
                return true;
            },

            "Nav.Current": async () => model.path,
        },

        mount: () => {
            model.__onPopState = () => { model.path = window.location.pathname; };
            window.addEventListener("popstate", model.__onPopState);
            model.path = window.location.pathname;
        },

        unmount: () => {
            window.removeEventListener("popstate", model.__onPopState);
            model.__onPopState = undefined;
        },

        View: () => (
            <div id={model.htmlId()} className="app-router">
                <model._ScreenView />
            </div>
        ),
    };

    const model = useUIBase(struct, params);
    return model;

    // Private methods
    function _match(path: string) {
        const segments = path.split("?")[0].split("/").filter(Boolean);
        for (const pattern of Object.keys(appRoutes)) {
            const patternSegments = pattern.split("/").filter(Boolean);
            if (patternSegments.length !== segments.length) continue;

            const routeParams: Record<string, string> = {};
            const matched = patternSegments.every((patternSegment, i) => {
                if (patternSegment.startsWith(":")) {
                    routeParams[patternSegment.slice(1)] = decodeURIComponent(segments[i]);
                    return true;
                }
                return patternSegment === segments[i];
            });

            if (matched) return { render: appRoutes[pattern], params: routeParams };
        }
        return undefined;
    }
}

const AppRouter = UECA.getFC(useAppRouter);

export { type AppRouterModel, useAppRouter, AppRouter };
```

---

## 5 · The shell

### `src/core/appLayout.tsx`

Chrome around the content. The content arrives as a `*View` **slot** the owner fills — that is
composition over configuration in its smallest form.

```tsx
import * as UECA from "ueca-react";
import { type UIBaseModel, type UIBaseParams, type UIBaseStruct, useUIBase } from "../components";

type AppLayoutStruct = UIBaseStruct<{
    props: {
        appName: string;
        // The slot: the owner passes its own content's View.
        contentView: UECA.ReactElement;
    };

    methods: {
        _MenuView: () => UECA.ReactElement;
    };
}>;

type AppLayoutParams = UIBaseParams<AppLayoutStruct>;
type AppLayoutModel = UIBaseModel<AppLayoutStruct>;

const menuItems = [
    { path: "/", caption: "Home" },
];

function useAppLayout(params?: AppLayoutParams): AppLayoutModel {
    const struct: AppLayoutStruct = {
        props: {
            id: useAppLayout.name,
            appName: "",
            contentView: undefined,
        },

        methods: {
            _MenuView: () => (
                <nav className="app-menu">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            id={model.htmlId() + "-menu-" + item.path}
                            className="app-menu-item"
                            onClick={() => void model.goToRoute(item.path)}
                        >
                            {item.caption}
                        </button>
                    ))}
                </nav>
            ),
        },

        View: () => (
            <div id={model.htmlId()} className="app-layout">
                <header className="app-topbar">{model.appName}</header>
                <div className="app-body">
                    <model._MenuView />
                    <main className="app-content">{model.contentView}</main>
                </div>
            </div>
        ),
    };

    const model = useUIBase(struct, params);
    return model;
}

const AppLayout = UECA.getFC(useAppLayout);

export { type AppLayoutModel, useAppLayout, AppLayout };
```

### `src/core/appUI.tsx`

Owns the visual services and the router, and decides what the app shows.

```tsx
import * as UECA from "ueca-react";
import { type UIBaseModel, type UIBaseParams, type UIBaseStruct, useUIBase } from "../components";
import { type AppRouterModel, useAppRouter } from "./appRouter";
import { type AppLayoutModel, useAppLayout } from "./appLayout";
import { type AppDialogManagerModel, useAppDialogManager } from "./appDialogManager";
import { type AppBusyDisplayModel, useAppBusyDisplay } from "./appBusyDisplay";

type AppUIStruct = UIBaseStruct<{
    props: {
        appName: string;
    };

    children: {
        router: AppRouterModel;
        layout: AppLayoutModel;
        dialogs: AppDialogManagerModel;
        busy: AppBusyDisplayModel;
    };
}>;

type AppUIParams = UIBaseParams<AppUIStruct>;
type AppUIModel = UIBaseModel<AppUIStruct>;

function useAppUI(params?: AppUIParams): AppUIModel {
    const struct: AppUIStruct = {
        props: {
            id: useAppUI.name,
            appName: "",
        },

        children: {
            router: useAppRouter(),

            layout: useAppLayout({
                // Bindings, not constants: a children-section constant is only an initial value.
                appName: () => model.appName,
                contentView: () => <model.router.View />,
            }),

            dialogs: useAppDialogManager(),
            busy: useAppBusyDisplay(),
        },

        View: () => (
            <div id={model.htmlId()} className="app-ui">
                <model.layout.View />
                <model.dialogs.View />
                <model.busy.View />
            </div>
        ),
    };

    const model = useUIBase(struct, params);
    return model;
}

const AppUI = UECA.getFC(useAppUI);

export { type AppUIModel, useAppUI, AppUI };
```

### `src/core/application.tsx`

The root. Owns the non-visual services so they mount for the app's lifetime, and delegates drawing
to `AppUI`.

```tsx
import * as UECA from "ueca-react";
import { type UIBaseModel, type UIBaseParams, type UIBaseStruct, useUIBase } from "../components";
import { type ApiServiceModel, useApiService } from "../api";
import { type AppUIModel, useAppUI } from "./appUI";

type ApplicationStruct = UIBaseStruct<{
    props: {
        applicationName: string;
    };

    children: {
        api: ApiServiceModel;
        ui: AppUIModel;
    };
}>;

type ApplicationParams = UIBaseParams<ApplicationStruct>;
type ApplicationModel = UIBaseModel<ApplicationStruct>;

function useApplication(params?: ApplicationParams): ApplicationModel {
    const struct: ApplicationStruct = {
        props: {
            id: useApplication.name,
            applicationName: "",
        },

        children: {
            api: useApiService(),

            ui: useAppUI({
                appName: () => model.applicationName,
            }),
        },

        messages: {
            "App.GetInfo": async () => ({ appName: model.applicationName }),
        },

        // See the note in homeScreen.tsx: a delegating View still carries its own id.
        View: () => (
            <div id={model.htmlId()} className="contents">
                <model.ui.View />
            </div>
        ),
    };

    const model = useUIBase(struct, params);
    return model;
}

const Application = UECA.getFC(useApplication);

export { type ApplicationModel, useApplication, Application };
```

---

## 6 · Screens

### `src/core/screenLayout.tsx`

The frame every screen uses: a title, a toolbar slot and a body slot.

```tsx
import * as UECA from "ueca-react";
import { type UIBaseModel, type UIBaseParams, type UIBaseStruct, useUIBase } from "../components";

type ScreenLayoutStruct = UIBaseStruct<{
    props: {
        title: string;
        toolbarView: UECA.ReactElement;
        contentView: UECA.ReactElement;
    };
}>;

type ScreenLayoutParams = UIBaseParams<ScreenLayoutStruct>;
type ScreenLayoutModel = UIBaseModel<ScreenLayoutStruct>;

function useScreenLayout(params?: ScreenLayoutParams): ScreenLayoutModel {
    const struct: ScreenLayoutStruct = {
        props: {
            id: useScreenLayout.name,
            title: "",
            toolbarView: undefined,
            contentView: undefined,
        },

        View: () => (
            <section id={model.htmlId()} className="screen">
                <header className="screen-header">
                    <h1 className="screen-title">{model.title}</h1>
                    <div className="screen-toolbar">{model.toolbarView}</div>
                </header>
                <div className="screen-content">{model.contentView}</div>
            </section>
        ),
    };

    const model = useUIBase(struct, params);
    return model;
}

const ScreenLayout = UECA.getFC(useScreenLayout);

export { type ScreenLayoutModel, useScreenLayout, ScreenLayout };
```

### `src/screens/homeScreen.tsx`

The pattern every later screen copies: extend `useScreenBase`, own a `ScreenLayout` child, fill its
slots from `*View` methods.

```tsx
import * as UECA from "ueca-react";
import { type ScreenBaseModel, type ScreenBaseParams, type ScreenBaseStruct, useScreenBase } from "../components";
import { type ScreenLayoutModel, useScreenLayout } from "../core/screenLayout";

type HomeScreenStruct = ScreenBaseStruct<{
    props: {
        message: string;
    };

    children: {
        layout: ScreenLayoutModel;
    };

    methods: {
        _ToolbarView: () => UECA.ReactElement;
        _ContentView: () => UECA.ReactElement;
    };
}>;

type HomeScreenParams = ScreenBaseParams<HomeScreenStruct>;
type HomeScreenModel = ScreenBaseModel<HomeScreenStruct>;

function useHomeScreen(params?: HomeScreenParams): HomeScreenModel {
    const struct: HomeScreenStruct = {
        props: {
            id: useHomeScreen.name,
            title: "Home",
            message: "",
        },

        children: {
            layout: useScreenLayout({
                title: () => model.title,
                toolbarView: () => <model._ToolbarView />,
                contentView: () => <model._ContentView />,
            }),
        },

        methods: {
            _ToolbarView: () => (
                <button
                    id={model.htmlId() + "-refresh"}
                    onClick={() => void model.refresh()}
                >
                    Refresh
                </button>
            ),

            _ContentView: () => (
                <p id={model.htmlId() + "-message"}>{model.message || "Nothing loaded yet."}</p>
            ),

            // Overrides the ScreenBase no-op. The base's result is available if you need it.
            refresh: async () => {
                await model.runWithBusyDisplay(async () => {
                    model.message = `Loaded at ${new Date().toLocaleTimeString()}`;
                });
            },
        },

        // Runs on creation AND on every cache retrieval — the right place to load.
        init: () => { void model.refresh(); },

        // A component that delegates its whole body to a child still owns a root element carrying
        // its OWN id — identity is the trace path, the bus address and the test locator at once, and
        // without this the screen has no element of its own. `display: contents` means the wrapper
        // adds no box, so it costs nothing in layout.
        View: () => (
            <div id={model.htmlId()} className="contents">
                <model.layout.View />
            </div>
        ),
    };

    const model = useScreenBase(struct, params);
    return model;
}

const HomeScreen = UECA.getFC(useHomeScreen);

export { type HomeScreenModel, useHomeScreen, HomeScreen };
```

### `src/screens/index.ts`

```ts
export * from "./homeScreen";
```

---

## 7 · Bootstrap

### `src/core/appStart.tsx`

```tsx
import { createRoot } from "react-dom/client";
import * as UECA from "ueca-react";

function runApplication(
    AppView: () => UECA.ReactElement,
    rootElementId: string,
    onError?: UECA.ErrorHandler
) {
    // Set once, before the first render.
    UECA.globalSettings.errorHandler = onError;

    const host = document.getElementById(rootElementId);
    if (!host) {
        throw new Error(`Root element "${rootElementId}" was not found.`);
    }

    createRoot(host).render(<AppView />);
}

export { runApplication };
```

### `src/main.tsx`

```tsx
import * as UECA from "ueca-react";
import { Application } from "./core/application";
import { appMessageBus } from "./core/appMessage";
import { runApplication } from "./core/appStart";
import "./app.css";

// Development only: logs every model creation, render, property change and message.
UECA.globalSettings.traceLog = import.meta.env.DEV;

runApplication(
    () => (
        <Application
            id="app"
            applicationName="My Application"
        />
    ),
    "root",
    (error) => {
        console.error(error);
        void appMessageBus().unicast("App.UnhandledException", error);
    }
);
```

### `src/core/index.ts`

```ts
export * from "./appMessage";
export * from "./appStart";
export * from "./application";
export * from "./appUI";
export * from "./appRouter";
export * from "./appRoutes";
export * from "./appLayout";
export * from "./appDialogManager";
export * from "./appBusyDisplay";
export * from "./screenLayout";
```

### `index.html`

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My Application</title>
    </head>
    <body>
        <div id="root"></div>
        <script type="module" src="/src/main.tsx"></script>
    </body>
</html>
```

### `src/app.css`

Minimal, and entirely yours to replace. Keep component styling in a CSS file beside each component.

```css
:root { --app-gap: 12px; }
body { margin: 0; font: 14px system-ui, sans-serif; }

/* Carries an id without adding a box — used by a View that delegates its body to a child. */
.contents { display: contents; }

.app-layout { display: flex; flex-direction: column; height: 100vh; }
.app-topbar { padding: var(--app-gap); font-weight: 600; border-bottom: 1px solid #ddd; }
.app-body { display: flex; flex: 1; min-height: 0; }
.app-menu { display: flex; flex-direction: column; padding: var(--app-gap); border-right: 1px solid #ddd; }
.app-content { flex: 1; min-width: 0; overflow: auto; padding: var(--app-gap); }

.app-dialog-backdrop { position: fixed; inset: 0; display: grid; place-items: center; background: rgb(0 0 0 / 40%); }
.app-dialog { background: #fff; border-radius: 6px; padding: var(--app-gap); min-width: 280px; }
.app-dialog-buttons { display: flex; justify-content: flex-end; gap: 8px; }

.app-busy { position: fixed; inset: 0; display: grid; place-items: center; background: rgb(255 255 255 / 50%); }
```

---

## `tsconfig` note

Application code is written on the premise **`strictNullChecks: false`** — every model prop is
`T | undefined` by design, so the flag adds narrowing work without adding safety. Keep the rest of
`strict` on.

```json
{
    "compilerOptions": {
        "strict": true,
        "strictNullChecks": false,
        "jsx": "react-jsx",
        "moduleResolution": "bundler",
        "target": "ES2020",
        "module": "ESNext"
    }
}
```

## What to add next, and where

| You need | Add |
| --- | --- |
| a new screen | a `useScreenBase` component in `screens/`, plus a line in `appRoutes.tsx` |
| a reusable control | a `useUIBase` component in `components/` |
| an input or a form | a `useEditBase` component — validation comes with it |
| a server call | an entry in `appMessage.ts` and a handler in `apiService.tsx` |
| notifications / toasts | a service beside `appDialogManager.tsx`, owned by `AppUI` |
| local storage, auth, theming | a service with `View: () => null`, owned by `Application` |
| the trace viewer | `<UECA.TraceViewerButton/>` inside `AppUI`'s View |
