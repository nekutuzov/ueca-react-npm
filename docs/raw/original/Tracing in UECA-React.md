# Tracing in UECA-React
#tracing #debug #log

Every component in a UECA application reports what it does — created, initialised, rendered, a property
changed, a value arrived through a binding, a message sent and handled. Turn tracing on and you can watch
that happen live, or record it and read it back later, one event at a time.

<a href="https://nekutuzov.github.io/ueca-react-npm/docs/tools/trace-viewer.html#trace=../../media/demo-trace.json&view=graph" target="_blank" rel="noopener"><img src="https://raw.githubusercontent.com/nekutuzov/ueca-react-npm/master/media/trace-viewer-graph.png"
     alt="The UECA trace viewer showing the component graph of the documentation site: components nested inside their owners, the message bus down the left, bindings on the right, and the record panel reading a broadcast the side menu handled" width="900"></a>

**Try it now.** <a href="https://nekutuzov.github.io/ueca-react-npm/docs/tools/trace-viewer.html#trace=../../media/demo-trace.json&view=graph" target="_blank" rel="noopener">Open a recorded session</a>
— a short visit to the UECA documentation site: a few pages, a few table-of-contents clicks, a screen torn
down and built again. It opens in a tab of its own, and everything in it works.

Or trace something live: the [UECA documentation site](https://nekutuzov.github.io/ueca-react-doc/) has the
viewer button in its bottom-right corner, so one click traces the page you are reading.

## Put the viewer in your application

Drop the button at the root of your application:

```tsx
<UECA.TraceViewerButton/>
```

It sits in the bottom-right corner of the screen wherever the application navigates. Click it and the
viewer opens in a browser tab of its own, following the live trace — put it on a second monitor and keep
using the application. Clicking again brings that tab back rather than opening another.

Rather have it over the application, with no window to manage?

```tsx
<UECA.TraceViewerButton target="overlay"/>
```

Escape closes it. If the browser blocks the new tab, you get the overlay anyway.

Or give the viewer a place in your own layout:

```tsx
{model.showTrace && <UECA.TraceViewer height="70vh"/>}
```

A viewer raises capture only while it is open and puts the previous setting back when it closes, so a
closed button costs the application nothing.

| Prop | Button | Panel | Default | What it does |
| --- | :---: | :---: | --- | --- |
| `target` | ✓ | | `"tab"` | `"tab"` or `"overlay"` |
| `placement` | ✓ | | `"bottom-right"` | any corner, or `"inline"` to render it where you put it |
| `capture` | ✓ | ✓ | `5000` | how many recent events to keep while the viewer is open |
| `throttle` | ✓ | ✓ | `400` | milliseconds between refreshes, however many events arrive |
| `height` | | ✓ | `560` | panel height — a number of pixels, or any CSS length |
| `theme` | ✓ | ✓ | `"auto"` | `"light"`, `"dark"` or `"auto"` — see below |
| `label`, `size` | ✓ | | | the button's tooltip and icon size |
| `className`, `style` | ✓ | ✓ | | `style` is applied last, so `style={{ bottom: 80 }}` nudges a pinned button |

`theme="auto"` follows your application: if it sets `color-scheme` on its root, the viewer reads it from
there, and otherwise follows the system. Whoever is reading can still switch it from the **theme** control
in the viewer's header.

The viewer never appears in its own trace — it is a plain React component with no model — so what you see
is your application and nothing else.

## Record without the viewer

Capture works with no viewer open and nothing written to the console:

```typescript
UECA.globalSettings.tracing = { capture: 5000 };   // keep the last 5000 events in memory
```

Reproduce the problem, then take the recording out:

```typescript
UECA.trace.save();          // downloads ueca-trace.json
UECA.trace.save("f.mmd");   // ...or a Mermaid sequence diagram
UECA.trace.records();       // the events themselves, oldest first
UECA.trace.toJSON();        // the same, as JSON
UECA.trace.clear();
```

In the browser's devtools, `window.UECA` is `UECA.globalSettings` with `trace` on it, so any page running
UECA can be recorded from the console: `window.UECA.tracing = { capture: 5000 }`, then
`window.UECA.trace.save()`.

Open `node_modules/ueca-react/docs/tools/trace-viewer.html` straight from disk — it is a single file with no
dependencies — and drop the saved file on it, paste its JSON, or choose it.

To forward every event somewhere of your own as it happens, add a sink:
`UECA.globalSettings.tracing = { capture: 5000, sink: record => myLogger(record) }`.

## Reading a trace

### Five views of one recording

| View | Shows | Try it |
| --- | --- | --- |
| **Table** | one row per event, with what it carried in the details column | <a href="https://nekutuzov.github.io/ueca-react-npm/docs/tools/trace-viewer.html#trace=../../media/demo-trace.json&view=table" target="_blank" rel="noopener">open</a> |
| **Timeline** | one lane per component against time — a dense column of renders on one lane *is* a re-render storm | <a href="https://nekutuzov.github.io/ueca-react-npm/docs/tools/trace-viewer.html#trace=../../media/demo-trace.json&view=timeline" target="_blank" rel="noopener">open</a> |
| **Sequence** | who called whom: a message is a solid arrow to its handler and a dashed one back when it completes | <a href="https://nekutuzov.github.io/ueca-react-npm/docs/tools/trace-viewer.html#trace=../../media/demo-trace.json&view=sequence" target="_blank" rel="noopener">open</a> |
| **Tree** | the ownership hierarchy, each component with a bar of its own events coloured by kind | <a href="https://nekutuzov.github.io/ueca-react-npm/docs/tools/trace-viewer.html#trace=../../media/demo-trace.json&view=tree" target="_blank" rel="noopener">open</a> |
| **Graph** | the application as it is wired, lighting up as the recording plays | <a href="https://nekutuzov.github.io/ueca-react-npm/docs/tools/trace-viewer.html#trace=../../media/demo-trace.json&view=graph" target="_blank" rel="noopener">open</a> |

### Click a record to read it

<img src="https://raw.githubusercontent.com/nekutuzov/ueca-react-npm/master/media/trace-viewer-table.png"
     alt="The table view with one bus record selected, its related records tinted, and the record panel showing the whole dispatch it belonged to" width="900">

Click a row, a dot on the timeline or an arrow on the sequence. The record panel opens beside it with the
value in full and the records that belong with it: the render pass it sat inside, the dispatch it was part
of, and the same component's events either side. Click one of those to jump to it. Click the record you
are on again to put the panel away.

That click also moves the **play head**. There is only one position on the page — the marked row, the
ringed dot, the lit component and the line on the strip all move together.

### The activity strip: pick a stretch of time

The strip across the top is the whole recording as bars over time, with warnings and errors pinned above it.
Stretches where nothing happened are closed up to thin grey columns — point at one to see how long it was —
so the bursts of activity get the width.

What the strip shows is what every view shows. **Scroll** on it to zoom about the pointer, drag across a
stretch to zoom straight to it, shift-drag to move along, double-click to see everything again. Click
anywhere to move the head there, or drag the handle at its foot to scrub.

### Play it back

| Control | Keys | |
| --- | --- | --- |
| ⏮ ⏭ | `Home` `End` | to the start, to the newest event |
| the buttons either side of play | `←` `→` | one event at a time |
| ▶ | `Space` | play and pause |
| **beat** | | `0.1 s`, `0.5 s`, `2 s` or `real` |

The beat is the shortest time two events are shown apart, so a burst of forty events inside a millisecond
plays as forty events, not one flash. A long quiet stretch costs one short rest however long it really ran.
`real` plays events at their true spacing — watch a cascade happen at the speed it happened — and still
never waits more than a quarter of a second on a gap.

On a **live** trace the head **follows**: it rides the newest event and each one lights up as it arrives.
Clicking, stepping or scrubbing lets go, so you can read what you landed on while the trace grows behind
you; ⏭ or **follow** takes you back to the present. **Pause** freezes the view without stopping recording,
**Clear trace** empties the application's buffer, and **keep** sets how much of it to hold.

### Narrow it down

- **Find** — press `/` from anywhere. A bare word matches the line, the path or the model; `field:value`
  matches one field exactly, so `cast:1` finds one dispatch and not `cast #10`. Terms combine.
  Fields: `seq` `kind` `level` `model` `path` `cache` `hook` `prop` `source` `dir` `bond` `owner`
  `ownerPath` `bus` `msg` `address` `via` `cast` `count`. `Escape` clears it.
- **Kinds** — sixteen kinds of event, each a chip with a bar showing how much of the trace it is. A trace
  opens on five — `bus`, `bind`, `prop`, `render` and `diag` — because the lifecycle and cache events
  outnumber them several times over. **Clear filters** switches all sixteen back on.
- **Components** — search the application's tree, then `only` to show a component or `hide` to take it
  away, each with everything under it. In the Tree and the Graph what you leave out disappears, and the
  owners in between stay, so two components in different branches still show where they sit.
- **on screen only** — in the same popover. Draws the application as it stands *where the head is*:
  a component goes when its `deinit` passes and comes back when it is initialised again, so an application
  that switches screens shows the screen that is up instead of every screen you ever visited. Play the
  demo from the start with it on and watch the documentation screen go when the reader goes Home.

Click anything in the details column to filter by it. A bus message there says how it was sent —
`unicast`, `broadcast`, `broadcast=app.ui.*`, `castTo=app.localStorage` — and its handling and completion
read `handle` and `return[1]`; `return[0]` means nobody was listening.

### Read the graph

- **Left edge: the message bus.** A dispatch leaves the sender's left edge, runs down the trunk at the far
  left, and comes in at the handler's left edge.
- **Right edge: bindings.** A binding hangs off a channel inside its owner's box, with a branch to each
  child it binds.
- **A ring** is where a signal leaves, **an arrowhead** where it arrives, **a dot** a branch. Arrowheads at
  both ends mean a two-way binding.
- **Point at a line** to light that one route end to end, with a tooltip saying what it carried and how
  often.
- **Click a box's header** to fold it. Parts of the tree that never touch the bus open folded; a folded box
  keeps every line that reaches inside it.
- **Scroll** to move, `Ctrl` + scroll to zoom; **−**, **+**, **100%**, **width** and **all** in the corner.
  Once the picture is bigger than the pane, an overview in the corner shows where you are.

A binding declared in a component's own struct lights that component but draws no line: the trace knows
where the value arrived, not where the getter reached for it.

### Save it

**Save as** writes the **trace** as `.json` — the rows your filters left, so clear them first for
everything — or the **graph** as an `.svg`, folded and filtered the way it is on screen, with its tooltips
still there when you open the file in a browser. A saved trace dropped back on the viewer opens at the
clock times it was recorded at.

## The console log

For a quick look without any viewer, write every event to the console:

```typescript
UECA.globalSettings.traceLog = true;
```

Each line names the event, the component's model id and its path:

```plaintext
create model=#123456 path=useButton
init model=#123456 path=app.ui.mainForm.button
change prop model=#123456 path=app.ui.mainForm.button[caption] ""➝"Click Me"
render view model=#123456 path=app.ui.mainForm.button
```

The path starts as the hook's name and becomes the full `app.ui.mainForm.button` once the component has an
owner; the model id stays the same, so search for `model=#123456` to follow one component through
everything it did.

What gets logged:

- **Models** — `create`, and the lifecycle hooks `constr`, `init`, `draw`, `mount`, `erase`, `unmount`,
  `deinit`.
- **Renders** — `render view`.
- **Property changes** — `change prop …[name] old➝new`, only when the value really changed.
- **Binding syncs** — `bind in …` when a value arrives through a binding rather than by assignment, and
  `bind out …` when an assignment is pushed back through a two-way one. A binding that works out the
  value the property already holds carries nothing, so nothing is logged.
- **Messages** — `bus send`, one `bus handle` per subscriber, and `bus done`, tied together by `cast=#n`.
  The send and the completion name the sender; a message sent from outside any component has none to name.
- **Caching** — `cache static`, `use cached dynamic` and the rest.

## Good to know

- Leave `traceLog` off in production; it is for development. Capture is cheap, but it holds that many
  events in memory.
- `model.fullId()` gives you the same path the trace uses, which maps a line straight to a component — in
  a test, too.
- An error inside a component's view is only shown as a placeholder while `traceLog` is on; with tracing
  off the component simply renders nothing. Turn it on before concluding a component is empty.
