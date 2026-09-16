# Testing UECA components

A UECA test is not a React test with different imports. Three properties of the component model
decide how every test in the file has to be written, and getting them wrong produces tests that pass
while the component is broken.

## The three facts that shape a test

1. **A component draws nothing on its first render.** The model is created in an effect, so the first
   pass returns `null`. Assert after the mount has settled, never straight after `render`.
2. **Errors are swallowed.** A throwing `View`, `onChange*` handler or lifecycle hook does not
   propagate — it reaches `globalSettings.errorHandler`. A test that does not collect those passes
   against a component that is on fire.
3. **A `messages:` subscription lasts exactly as long as the mount.** Leave a component mounted
   between tests and the next `unicast` finds two subscribers and throws before dispatching.

## The harness

Whole thing, public API only. Put it beside your tests and import it everywhere.

```tsx
import * as UECA from "ueca-react";
import { render, waitFor } from "@testing-library/react";
import { expect } from "vitest";

// Errors UECA caught on our behalf since the last check.
const uecaErrors: Error[] = [];
UECA.globalSettings.errorHandler = (error) => { uecaErrors.push(error); };

// Call in afterEach: a swallowed error must fail the test that caused it.
function assertNoUecaErrors() {
    const errors = uecaErrors.splice(0);
    expect(errors.map((e) => e?.message)).toEqual([]);
}

// Takes them instead, for a test that provokes one deliberately.
function takeUecaErrors(): Error[] {
    return uecaErrors.splice(0);
}

// Mounts a component and resolves once its model exists — i.e. after the render that actually draws.
async function mountComponent<TStruct extends UECA.AnyComponentStruct>(
    Component: (params: UECA.ComponentParams<TStruct>) => UECA.ReactElement,
    params: UECA.ComponentParams<TStruct>
): Promise<UECA.ComponentModel<TStruct>> {
    let model: UECA.ComponentModel<TStruct>;
    render(<Component {...params} init={(m) => { model = m; }} />);
    await waitFor(() => { expect(model).toBeDefined(); });
    return model;
}

// Lets pending renders, bindings and message handlers finish before the next assertion.
async function settle() {
    await waitFor(() => {});
}

export { mountComponent, settle, assertNoUecaErrors, takeUecaErrors };
```

Two things worth knowing about it:

- `init` is the lifecycle hook, passed as a param — every hook receives the model, which is how the
  test gets hold of it without the component exporting anything beyond its usual three names.
- **The type argument is inferred** from the component you pass, so `model` comes back fully typed
  with no annotation at the call site. It does overwrite an `init` of your own; if you need one, set
  it on the returned model instead.

## Using it

```tsx
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { Counter } from "./counter";

// Unmount releases the bus subscriptions. Without this the second test in the file throws.
afterEach(() => {
    cleanup();
    assertNoUecaErrors();
});

it("counts up by its step", async () => {
    const model = await mountComponent(Counter, { id: "counter", step: 5 });

    expect(model.count).toBe(0);

    model.count += model.step;          // assign to the model, not to the DOM
    await settle();                     // let the view re-render

    expect(document.getElementById("counter")?.textContent).toContain("5");
});
```

**Drive the model, assert on the DOM.** Clicking a button and asserting a model property is also
valid — what is not valid is asserting on either one without a `settle()` in between.

## Replacing a service

A service is whoever answers the message, so a fake is a component that answers it instead. Nothing
needs to be injected, and there is nothing to mock.

```tsx
const saved: { id: string }[] = [];

type FakeApiStruct = UECA.ComponentStruct<{ props: { calls: number } }, AppMessage>;
type FakeApiParams = UECA.ComponentParams<FakeApiStruct, AppMessage>;
type FakeApiModel = UECA.ComponentModel<FakeApiStruct, AppMessage>;

function useFakeApi(params?: FakeApiParams): FakeApiModel {
    const struct: FakeApiStruct = {
        props: {
            id: useFakeApi.name,
            calls: 0,
        },

        messages: {
            "Api.Sample.SaveItem": async (item) => { saved.push(item); model.calls++; },
        },

        View: () => null,
    };

    const model = UECA.useComponent(struct, params);
    return model;
}

const FakeApi = UECA.getFC(useFakeApi);

// In the test: mount it alongside the component under test.
const fake = await mountComponent(FakeApi, { id: "fakeApi" });
// …exercise the component…
expect(fake.calls).toBe(1);
```

It is an ordinary component — the canonical three declarations, `View: () => null`, and the handler as
its entire public surface. **Mount only one answerer per message**: `unicast` throws on two, before it
dispatches to either.

For a message you only need to observe, that is the whole technique. To assert on it, give the fake a
prop and let the handler write to it, as `calls` does above.

## Things that will bite

| Symptom | Cause | Fix |
| --- | --- | --- |
| `model` is `undefined` right after `render` | the first render draws nothing | await the mount — that is what `mountComponent` does |
| an assertion reads a stale value | the view has not re-rendered yet | `await settle()` between the assignment and the assertion |
| the test passes but the component is visibly broken | a throwing View was swallowed | assert `assertNoUecaErrors()` in `afterEach` |
| **"more than one subscriber"** on the second test | the previous component is still mounted | `cleanup()` in `afterEach` |
| a `mount` hook cannot find its element | a crashed component still mounts — `mount()` runs although `draw()` never did | check for a collected error first; do element work in `draw` |
| an element has no size, or a virtualised list renders nothing | **jsdom has no layout** — every box is 0×0 | stub `clientHeight` / `getBoundingClientRect` on the element, and `ResizeObserver` |
| something looks wrong under `React.StrictMode` | probably not this: StrictMode **is** supported. Its double render is discarded, `constr`/`init`/`mount` each run once, and `fullId()` resolves against the surviving parent — identical to a plain render | look elsewhere in this table |

## Finding ids

A DOM id is the model's path — `app.ui.loginForm.userInput` — so `document.getElementById` is often
the most precise query available, and it is the same string the bus and the model cache use. Where an
accessible query fits, prefer it; where it does not, use the id rather than a brittle selector.

## When a test fails and the reason is not obvious

```ts
UECA.globalSettings.traceLog = true;
```

That records every model creation, hook, render, property change, binding sync, cache decision and
bus dispatch — including the render errors that are otherwise invisible. See `reference/pitfalls.md`.

## A worked suite

demo2 carries ~125 test files built on exactly this: component tests beside each component, and
whole-application tests in `src/integration/` that mount the real app at a URL. Its helpers are in
`src/test/`. See `ueca-app-architecture`, `reference/reference-apps.md`.
