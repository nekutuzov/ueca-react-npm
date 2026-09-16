# Reference applications

Three complete applications are published, built on this architecture. **Read them before inventing
anything** — most of what a new app needs already exists in one of them, written the UECA way and
under test.

| App | What it is | Live |
| --- | --- | --- |
| [`ueca-react-app`](https://github.com/nekutuzov/ueca-react-app) | the bare-minimum template — closest thing to `reference/scaffold.md` as a running repository | — |
| [`ueca-react-app-demo1`](https://github.com/nekutuzov/ueca-react-app-demo1) | the same architecture with **Material-UI** underneath, rather than hand-built controls | [demo1](https://nekutuzov.github.io/ueca-react-app-demo1/) |
| [`ueca-react-app-demo2`](https://github.com/nekutuzov/ueca-react-app-demo2) | **the one to read.** ~50 components on plain HTML/CSS/SVG, no UI library, two themes, a Showcase of every control and a Playground that edits one live | [demo2](https://nekutuzov.github.io/ueca-react-app-demo2/) |

Everything below indexes **demo2**, on `master`. Browse a folder at
`https://github.com/nekutuzov/ueca-react-app-demo2/tree/master/<path>`, or read one file raw at
`https://raw.githubusercontent.com/nekutuzov/ueca-react-app-demo2/master/<path>`.

Also shipped in this package, beside these skills: the full framework documentation at
`node_modules/ueca-react/docs/raw/index.md`, and online at
<https://nekutuzov.github.io/ueca-react-doc/>.

> **On demo2's components.** They are read-and-copy today: there is no package to install, so you
> take the file into your own tree and own it from then on. That component library is intended to be
> published separately as **`ueca-react-components`**; until it is, treat every path below as a source
> to copy from, not a dependency to add. Check npm before assuming either way.

## I need… → read this

### Controls

| You need | demo2 path |
| --- | --- |
| a button, an icon button, toolbar shorthands (Save / Delete / Refresh…) | `src/components/buttons/` |
| a text, number, search field — validation, adornments, debounce | `src/components/inputs/` |
| select, checkbox, switch, radio group | `src/components/inputs/` |
| a data table — sorting, filter row, selection, resize, virtualisation | `src/components/data/table/` |
| a long list that must stay fast | `src/components/data/virtualList/`, `.../filterableList/` |
| tabs | `src/components/tabs/` |
| a modal dialog, an alert dialog, an anchored popover | `src/components/popups/` |
| a drawer, a record-editor drawer, a toast, a snackbar | `src/components/flyouts/` |
| a menu built from real child models rather than a config array | `src/components/menus/` |
| breadcrumbs, nav links, sidebar items, expandable groups | `src/components/navigation/` |
| icons, status labels, progress, spinner, markdown, drop zone, file picker | `src/components/misc/` |
| layout primitives — `Block` / `Row` / `Col` / `Grid` / `Card` | `src/components/layout/` |

### Architecture

| You need | demo2 path |
| --- | --- |
| the base chain — `useBase` → `useUIBase` → `useEditBase` / `useScreenBase` | `src/components/base/` |
| the full message contract, in one file | `src/core/infrastructure/appMessage.ts` |
| the root model and the shell | `src/core/infrastructure/application.tsx`, `appUI.tsx` |
| routing, route table, history, document title | `appRouter.tsx`, `appRoutes.tsx`, `appBrowsingHistory.ts` |
| sign-in and an authorisation gate | `appSecurity.tsx`, `appLoginForm.tsx`, `appAuthForm.tsx` |
| dialogs, toasts, busy overlay, the single app-wide tooltip | `appDialogManager.tsx`, `appAlertManager.tsx`, `appBusyDisplay.tsx`, `appTooltipManager.tsx` |
| light/dark themes, persisted, no flash on load | `appThemeManager.tsx`, `appTheme.ts`, `src/themes.css`, `index.html` |
| a `localStorage` wrapper with typed keys | `appLocalStorage.ts`, `appTypes.ts` |
| the app chrome — collapsible sidebar, menu, top bar | `src/core/appLayout/` |
| a screen frame, and CRUD / tabbed screen variants | `src/core/screenLayout/` |
| a REST client behind the bus, and mocked endpoints | `src/api/`, `src/api/mocks/` |

### Techniques worth copying

| Technique | Where | Why it is interesting |
| --- | --- | --- |
| **One registry drives routes, menu, headers and next/prev links** | `src/screens/showcase/showcaseTopics.tsx` | a page is one entry plus a route; nothing else needs editing |
| **Switch-rendered screens instead of declared children** | `src/screens/showcase/showcaseScreen.tsx` | visiting one topic does not construct the other nine |
| **Generating source from a live model** | `src/screens/playground/codeGen.ts` | reads the model, omits every prop still at its default |
| **A properties panel driving a live instance** | `src/screens/playground/playgroundWorkbench.tsx` | two-way `bind()` at application scale |
| **One tooltip for the whole app, with per-trigger tokens** | `appTooltipManager.tsx` + `tooltipProps` in `src/components/base/base.tsx` | why a shared singleton needs trigger identity |
| **Whole-application tests** | `src/integration/appHarness.tsx` | `renderApp({ url, signedIn })` mounts the real app at an address |

## The shared message vocabulary

Every reference app — and `reference/scaffold.md` — uses these ids. Keep them and code lifted from
demo2 compiles in your app unchanged.

| Family | Entries |
| --- | --- |
| `Dialog.*` | `Information` `Warning` `Error` `Exception` `Confirmation` `ActionConfirmation` `Custom` `Close` |
| `Alert.*` | `Information` `Success` `Warning` `Error` |
| `BusyDisplay.*` | `Set` `Clear` `SetVisibility` |
| `App.Router.*` | `GetRoute` `GoToRoute` `SetRoute` `SetRouteParams` `OpenNewTab` `ResolveRoute` `BeforeRouteChange` `AfterRouteChange` |
| `App.Security.*` | `IsAuthorized` `Authorize` `Unauthorize` `GetSecurityInfo` |
| `App.Theme.*` | `GetTheme` `SetTheme` `ToggleTheme` `GetMode` `SetMode` `ListThemes` `Changed` |
| `App.LocalStorage.*` | `Read` `Write` `Clear` |
| `App.*` | `GetInfo` `UnhandledException` `SelectFiles` |
| `Api.<Domain>.<Operation>` | one entry per operation — `Api.Site.GetList`, never a generic `Api.Get(path)` |

Almost nothing calls these directly: they are wrapped as shorthand methods on `useBase`
(`model.dialogYesNo(...)`, `model.alertSuccess(...)`, `model.goToRoute(...)`), which is the whole
reason the base chain exists.

## How to use them

1. **Look before you write.** Search the index above for the nearest existing component.
2. **Copy the file, then cut it down.** These are production components with variants and themes you
   may not want. Keep the struct shape and the wiring; drop the rest.
3. **Bring its CSS.** Each component folder holds its own `.css`. It will reference theme tokens from
   `src/tokens.css` / `src/themes.css` — take those too, or replace them with your own.
4. **Its tests come with it.** Nearly every component has a `.test.tsx` beside it; it is the fastest
   way to learn what the component actually guarantees.

## What they are not

They are **applications**, not an extension of the library, and today they are source to read and
copy rather than packages to depend on (see the note above on `ueca-react-components`). Their base chain, layout primitives,
theme tokens and screen conventions are choices, not API — you may change any of them. Only what
`reference/public-api.md` lists is guaranteed by `ueca-react` itself.

Where an app and the library documentation disagree about the library, the documentation wins; where
they disagree about how to build an app, prefer the app — it runs and it is under test.
