# Tracing in UECA-React
#tracing #debug #log

Logging is a crucial part of debugging and monitoring your `ueca-react` application. The UECA framework provides a built-in logging mechanism that helps you trace component behavior, track property changes, and debug application flow. This section explains how to set up and use UECA logging effectively.

## Overview

UECA logging is designed to:
- Capture component lifecycle events.
- Log property changes and updates.
- Provide insights into the internal workings of your components.

By default, UECA uses the browser's `console` for output, but you can customize it to suit your needs by
installing a sink — see [Recording a trace](#recording-a-trace) below.

## Setting Up Logging

To enable logging in `ueca-react`, you need to set the `traceLog` flag in the global settings. This can be done in your entry file (e.g., `index.tsx`):

```typescript
import * as UECA from "ueca-react";

// Enable logging
UECA.globalSettings.traceLog = true;
```

To disable logging, set `traceLog` to `false`:

```typescript
import * as UECA from "ueca-react";

// Disable logging
UECA.globalSettings.traceLog = false;
```

## Recording a trace

The console is not the only destination, and it is not always the useful one. Two settings sit beside
`traceLog`, both independent of it:

```typescript
UECA.globalSettings.tracing = {
    capture: 5000,                       // keep the last 5000 events in memory
    sink: (record) => myLogger(record),  // and/or forward every event yourself
};
```

`capture` is what makes a bug you cannot reproduce on demand tractable: leave it on with
`traceLog = false`, so nothing reaches the console, then read the buffer once the problem appears.

```typescript
UECA.trace.records();     // the captured events, oldest first
UECA.trace.toJSON();      // the same, as JSON
UECA.trace.toMermaid();   // as a Mermaid sequence diagram
UECA.trace.save();        // download it as ueca-trace.json
UECA.trace.save("f.mmd"); // ...or the diagram, when the name ends .mmd or .mermaid
UECA.trace.clear();
```

Open `docs/tools/trace-viewer.html` and drop the saved file on it to read the trace as a table, a
timeline, a sequence diagram, a component tree, or a live graph of the application wiring itself. It is a
single page with no dependencies, so it works straight from disk.

At the far right of the header is **theme** — `light`, `dark` or `auto`. It opens at `auto`, which follows
whatever is outside the page: your application when the viewer is a panel inside one, your desktop when it
is a file opened from disk. Pick one of the other two to hold it whichever way that goes, and it stays
picked however the application changes around it. It is not remembered between sessions — the page keeps
no storage of its own, since embedded in an application the only storage it could reach is the
application's.

Across the top, under every view, is the **activity strip**: the recording drawn as bars over time,
coloured by kind, with any warning or error pinned above it as a triangle.

Its time axis is deliberately not proportional, and that is what makes it readable. An application works
in bursts and then waits for you, so most of a recording is waiting: a capture of 443 events spanning a
minute and a half holds them in five short bursts, and drawn to scale every one of them lands in the
first few pixels. So each stretch of quiet is closed up to a narrow grey column — point at one to see how
long it stood for — and the bursts share the rest of the width between them.

What the strip is showing *is* what everything is scoped to — there is no second range to keep track of.
Scroll to zoom in and out about the pointer, shift-drag or scroll sideways to move along, drag out a
fragment to zoom straight to it, and double-click for the whole recording again. Once you are inside it,
a thin rail underneath shows the whole trace with your part marked, and the chip above says how far in
you have gone and takes you back out.

The pale bars behind are everything recorded and the solid ones in front are what your other filters
kept, so the strip says both how busy the application was and how much of that you are currently looking
at. It also carries the **play head**, and dragging that is how you move it: click anywhere to send it
there, or take hold of the handle at the foot and scrub.

**Components** narrows every view to part of the application, and in the **Tree** and the **Graph** it
takes what you left out off the picture rather than dimming it — the owners in between stay, so you can
single out two components in different branches and still see where each of them sits. Hiding a component
takes everything under it too.

Beside **Clear** in that popover is **on screen only**, which draws the application *as it stands where
the play head is standing* rather than as the whole recording has known it. An application that switches
screens builds each one and tears the last one down, and a picture of everything the trace has ever named
holds every screen you have visited — one of which exists. With this on, a component goes when its
`deinit` passes and comes back when an `init` does, so the graph holds the screen that is up. Playing
from the beginning then reads forwards: screens arrive as the application builds them.

Two things it deliberately does not do. A component the recording says nothing about the life of is never
taken away — and neither is one whose first word in the capture is `deinit`, because that means it was
already alive when the recording began and its birth has simply rolled out of the ring. Absence of an
`init` is not evidence of death. A trace with no lifecycle records in it at all has nothing to go on, and
the popover says how many components are off screen so you can see that for yourself.

Clicking a row of the table opens the whole record beside it — the value in full, and the records that
belong with it: the render pass the event sat inside, the dispatch it was part of, and the same
component's events either side. Clicking one of those scrolls the table to it and marks it, and leaves the
panel on the record you are reading — the table decides what the panel shows, and the panel decides where
the table is looking. To read a different record, click its row.

Clicking a record is also how you move the play head, because they are the same thing. There is one
position on the page: the row that is marked, the ring on the timeline, the line on the strip, the
readout on the transport and the record in the panel are five ways of saying it, and moving it any one
of those ways moves all five. Step with the transport and the marked row walks with it; click a row and
the head goes there and stops, so you can read what you have just landed on.

It is the same panel from a **dot on the timeline** or an **arrow on the sequence**, because it is the
same record: the point picks up a yellow ring, its model name lights in the margin, and the panel opens
beside it. Clicking the record you are already on puts the panel away, and moving the head brings it
back. The chains inside work wherever it is open — in the table they scroll to the record, in the plots
they ring it for a moment.

It opens under the **Graph** too, where there is nothing to click and the head can only be walked: on a
picture of components this is the thing that says what each glow *was*. Not under the **Tree**, which
draws shape — which components exist and what owns what — and a single event says nothing about shape.

## Watching it happen

The **Graph** view draws the application as it is actually wired: every component as a box sitting inside
the one that owns it, and a line for every relationship the trace can prove. It answers two questions and
is kept clear of everything else — what the structure is, and how the parts talk.

Read it by **side** before you read it by colour. Every bus dispatch leaves a component's **left** edge,
runs down the one trunk in the gutter at the far left, and comes back in at the handler's left edge. Every
binding hangs off a channel on its owner's **right**, inside that owner's own box, with a branch across to
each child it binds. The two systems never touch the same edge, so you can tell a dispatch from a binding
with the colour taken away — and where they cross, they cross square.

Nothing is routed round anything, because nothing has to be. Each component owns a horizontal band of its
own and the trunk owns its gutter, so a stub cannot run through a box even in principle; a binding cannot
leave its parent, because the channel it hangs from is inside the parent. A stub does cross container
borders on its way to the gutter, and that is right: a component sends into the bus regardless of where it
sits in the tree, and a marker at the crossing would claim a hierarchy the bus does not have.

Three marks say what an end of a line is. A **ring** is where the signal leaves. A **dot** is a junction,
where a branch taps a line that carries on past it. An **arrowhead** is where the signal arrives. A binding
branch with an arrowhead at *both* ends is a two-way bond — either end can drive it — and one with a ring
at the channel and an arrowhead at the child is read-only. Two rings on one line would mean nobody
receives, so you will never see it; if you do, the trace is wrong.

The picture opens **short**. Any part of the tree that never touches the bus is folded when the trace
loads — it answers the structural question and nothing else, and you can open it when you want it. Nothing
is hidden by that: a folded container floats its children's connections up to its own edges and keeps every
line, so you can see what reaches inside it without opening it. Within a container, only the components
that talk get a full-width row of their own; the quiet leaves are laid out in columns beside each other,
several to a row, which is what keeps the picture from being one tall list of mostly nothing.

Each route gets a port of its own, so a service five things dispatch to has five arrivals down its left
edge rather than five lines crowding one point — and a component is exactly as tall as the number of lines
that touch it. Point at a ring or an arrowhead and that one route lights end to end *through* the trunk it
shares, while everything else recedes; point at the trunk itself and everything running through it lights,
because there is no single route to guess at. A tooltip says what the line stands for: how many times it
was used, and the messages or the props that went along it.

Nothing is **dashed**. A connection exists continuously and things merely fly along it sometimes, so the
line stays solid and what moves is the message: while one is in flight, marks travel along its route,
punched out of the page rather than painted in a colour of their own. They always run from the ring towards
the arrowhead, so on a route whose sender sits below its handler they travel upward.

Components sit on their own surface, and the things inside them on another: a container is a tray that
steps back as it nests, a component is a card on it, and a container's own name band is a third. There are
five steps to that ladder and it repeats every fifth level, which never shows, because your eye only ever
compares a box with the one it is sitting in. Depth is also in the indent, in the bar down each container's
left edge, and in the comb the right-hand channels make as they nest.

There are no counts and no bars on the picture. A trace is almost always one cascade — in a captured
sample, ninety-eight per cent of the records fall inside a ninety-millisecond window — so a per-component
total does not tell you how busy a component is, it tells you how much of that one cascade happened to
touch it, and a permanent badge saying so would mislead. What a component's **height** says is real:
the number of lines that touch it. A **folded** container floats its children's ports up to its own edges
and keeps every line, so a tall folded box means much of the application reaches inside it and a short one
means it is self-contained. Nothing disappears when you fold, because a branch that dropped its wiring
would read as dead.

A component with nothing in the current filter is still drawn — the picture is of the application, not of
the filter — but it recedes, so what is in the filter is what your eye lands on. A line recedes with it,
and never ends up louder than the quieter of the two things it joins: both ends out of the filter and it
goes grey and nearly away, one end out and it keeps its colour but steps back with the box it points at,
because that line is still part of how the thing you *are* looking at is wired.

On a **live** trace the picture lights up as the application works, with nothing pressed: the head sits
on the newest event and is carried along as more arrive, and each one flashes the moment it lands. That is
what **Follow** means, and it is on from the moment a live trace opens. Anything that places the head by
hand lets go of it — a click, a step, a scrub, pressing play — because you have said you want to look at
one thing rather than at whatever is happening now. ⏭ takes you back to the present, and **follow** — the
button beside it in the transport — keeps you there, and stays lit for as long as you are watching.
Scrolling does not let go — **follow** is a switch, not a guess at where you are looking. While it is on
the table is held on the head's row, so scrolling up during a live trace is undone by the next event. To
read something further up, click the row: that is a click, so it lets go, and the head goes to what you
clicked.

Press **play** to walk a recording instead — under any view, not only this one. The transport lives under
the strip because it belongs to the recording rather than to one picture of it, and each view says where
the head is in its own vocabulary: the table highlights the row and follows it down, the timeline rings the
dot, the sequence bands the row, and the graph lights the component. Where a view keeps its model names
in a column of their own — the timeline down the left, the sequence across the top — the name lights up
with the event, so *whose* it was can be read without tracing a line back to the margin.

On the graph, each event lights the component it belongs to in the colour of what it did — a halo, a
border and a wash over its own area — and lights the line that carried it, with the dashes running from
the sender towards the handler so a dispatch says which way it went. The component the head is standing
on keeps a yellow ring until the head moves on; the readout beside the transport names it.

An application works in bursts: forty events inside two hundred microseconds, then nothing at all for
fifteen milliseconds. Played at any constant multiple of real time that burst is a single flash and the
silence after it is a wait — and slowing the multiple down only makes the wait longer. So the head is
paced by **events**, and `beat` is the control: the shortest time any two of them will ever be shown
apart. On top of that a gap adds a **rest**, in proportion to how long it really was, so a burst still
reads as a burst — and any stretch of quiet long enough for the strip to close up costs exactly one rest,
however long it ran. The same threshold decides both, on purpose: a silence the picture has folded down
to nine pixels is not one the head should spend seconds crossing. `real` takes the lens off and
shows what actually happened, which on most traces is over before you have seen it.

What `real` takes off is the **floor**, not the ceiling. Two events fire as close together as they
happened — that is the point of it — but a gap still costs at most a quarter of a second, the same way it
does at a beat. A capture of 443 events spanning a minute and a half holds all but one of them inside two
thirds of a second, with one ninety-second wait in the middle; sitting through that wait is not reading
the trace, and the strip has already closed the stretch up to nine pixels.
On a trace like that, `real` is still over almost at once. If you want to watch it happen rather than
confirm what happened, set a beat.

`real` is where the control **opens**. Watching a live application is the ordinary case, and a following
head does not pay the beat at all — so a lens on by default only slows down a recording nobody asked to
have slowed. Set a beat when you want to read one back.

Glows last about as long as the beat, so what is still fading is the two or three events before this one
and nothing older — and every event replays the whole glow from nothing, including when it lands on a
component that is already lit. That last part matters more than it sounds: a cascade arrives on **one**
component over and over, twenty-one times in a row in one place in the sample trace, and holding it lit
through all of them draws twenty-one events as a single unbroken glow. Starting again from nothing puts a
beat between them, which is the only thing on the picture that says how many there were.

The transport is the one every recording has. `⏮` goes back to the start and `⏭` forward to the newest
event; the two either side of play step one event at a time, which is the speed a trace is actually read
at. It sits under the strip, and drives every view rather than this one. From the
keyboard: Space plays and pauses, `←` and `→` step, `Home` and `End` go to the ends.

With nothing in front of it there is nothing to play, so play is greyed out rather than starting again
from the beginning. The head is also the record you have open, and restarting would throw that away
without being asked; `⏮` is how you say you want it back at the start.

The picture only ever grows downward — every component that talks gets a row of its own — so it scrolls
like a document. **Scroll** to move through it, and hold **Ctrl** while scrolling to zoom about the
pointer. There is nothing to drag, and no scrollbar either: where you are and how much there is are both
the overview's job, and it answers them better than a trough on one edge — it is the shape of the whole
application with the part you are looking at outlined on it.

It opens at **life size**. The sizes it is drawn at were chosen to be read at 100%, and the pane says
nothing about how big a component ought to be — so **−** and **+** step through the usual round
percentages from there, and the number between them takes you straight back. **width** matches the
picture's width to the pane and **all** puts every component on screen at once, which on a deep
application can be very small.

Zoom in far enough and an overview appears in the corner with the part you are looking at outlined on it —
click or drag on that to jump somewhere else, which is quicker than scrolling when you know where you are
going.

Clicking a box's **header** folds that subtree away — the header and nothing else, because an owner's box
covers everything inside it and a click anywhere on that used to fold the lot. It is the same fold the
**Tree** view uses. Folding keeps the zoom, and puts the header you clicked back exactly where it was,
so the thing under the pointer does not move out from under it. Nothing ever refits the view on its own
— not a fold, and least of all a refresh; **fit** is there when you want it.

Everything on the picture answers the pointer — every box, leaf or owner, and every line. A thing that
lights up under the pointer is a thing you can ask about; a thing that does not is scenery.

Two things are worth knowing about what it can and cannot show. The whole application is always drawn, so
the picture never rearranges itself as you filter — the filter decides what **lights up**, not what
exists, which is what makes a glow readable as movement. And a binding line is drawn only where the trace
knows both of its ends: a bond declared in the params an owner passed came from that owner, and is drawn.
A bond declared in a component's own struct closed over whatever that component reached for, and the
record does not name it — so that one lights the component and draws no line, rather than inventing a
relationship.

The head holds its place in *time* rather than its place in a list, so narrowing the filter under it
leaves it standing at the same instant, and it plays from wherever you put it. On a live trace that means
the recording can go on growing without carrying you off the record you are reading.

Watching and reading are the two things you do with a live trace and they want opposite things from the
head, so they are two states of it rather than two mechanisms. Following, it walks towards the newest
event and stays there; let go of it and you are reading, and the trace grows behind you until you ask to
go back to the present.

Following pays the **beat** like everything else. A cascade is a sequence whether you are replaying it or
watching it happen, so a burst that lands in one refresh is shown an event at a time rather than as one
flash. What it does not pay is the stretching of the *gaps* — those are your own thinking time between one
click and the next, and stretching them would mean pressing a button and watching nothing light for a
second. The first event after a quiet moment shows at once; the ones behind it queue up at the beat.

And what a view **draws** stops at the head as well. A timeline that plotted everything the instant it
arrived would give the answer away before the beat had shown you any of it, so while you are following the
plot fills in left to right as the head reaches each event, the sequence fills downwards, and the table
grows a row at a time. Let go — pick a record, step, press the button — and the whole recording is there
again at once.

When the application outruns that — and it will, because it is not paced by anything — the head plays
faster rather than skipping ahead. Opening a screen is a hundred events inside a millisecond, and no beat
can show a hundred of anything without falling minutes behind; so the whole of it is walked, in order,
from the beginning, at whatever spacing gets back to the present within about four seconds. A hundred
events take four seconds and you see all hundred. Six take a beat each. The spacing widens as the backlog
shrinks, so a burst opens fast and settles back into the beat instead of stopping dead.

Only past the point where even one event per frame could not catch up — a few hundred at once — does it
skip, and then everything skipped still fires, so a storm registers as a flash rather than being lost.
What arrived while you were away is not replayed when you come back: you were not watching, and a hundred
glows at once draws the whole application as a single flash that says nothing about any of it.

## The Viewer Inside Your Application

The same five views are available without saving anything, as a component:

```tsx
{model.showTrace && <UECA.TraceViewer/>}
```

It turns capture on for as long as it is mounted, follows the trace as it grows, and puts the previous
setting back when it goes away. Nothing else is needed: no `traceLog`, no `save()`, no file.

```tsx
<UECA.TraceViewer capture={20000} throttle={250} height="70vh"/>
```

- `capture` — the ring size to guarantee while the panel is open. Default 5000. A larger existing setting
  is left alone.
- `throttle` — milliseconds between refreshes, however many events arrive in between. Default 400. A trace
  can grow thousands of records a second; the panel coalesces them into one refresh.
- `height` — how tall the panel is. Default 560.
- `theme` — `"light"`, `"dark"` or `"auto"`. Default `"auto"`, which follows your application: if it
  themes itself it declares that by setting `color-scheme` on its own root, and the viewer reads it from
  there; otherwise the system preference decides. Name one explicitly to override that. Whoever is reading
  the panel can override it again from the **theme** control in its header, and their pick stands until
  they put it back to `auto`.

Follow it rather than leaving it to the browser if your application has a theme of its own. The system
preference reports what the *desktop* prefers, and an application in its own dark theme on a light desktop
is overriding exactly that — so a viewer left to work it out alone reads the desktop and disagrees with
the application around it. This matters most for the button below, which opens a window of its own: that
window shares no CSS with the document that opened it, so being told is the only way it can know.

If you would rather not give the panel a place in your layout, put the button somewhere instead:

```tsx
<UECA.TraceViewerButton/>
```

It renders a small UECA mark in the bottom-right corner of the screen, and clicking it opens the viewer in
a browser tab of its own — the same live trace at the same refresh rate, only somewhere you can put it: a
second monitor, say, or beside the application rather than on top of it. The application stays usable
while you read, and the tab outlives a route change. Clicking again brings that tab back to the front
instead of opening another; it is left alone when the button unmounts, and clicking once more reconnects
it. That is the whole of it: drop one at the root of your application and it stays in its corner wherever
the application navigates, because it is fixed to the screen rather than placed in your layout.

`placement` moves it — `"bottom-left"`, `"top-right"`, `"top-left"`, or `"inline"` to render it in the flow
wherever you put it, in a toolbar of your own, say. It takes the same `capture` and `throttle`, plus
`theme`, `label`, `size`, `className` and `style`; `style` is applied after the corner, so
`style={{ bottom: 80 }}` nudges a pinned button clear of something without unpinning it. `theme` reaches
the panel chrome and the page inside it together, so the two always agree.

Or keep the viewer over the application, with no window to manage:

```tsx
<UECA.TraceViewerButton target="overlay"/>
```

The same panel, opened over the whole application with a close button in its top-right corner; Escape
closes it too. You get this anyway where a window cannot be had: if the browser refuses to open one, the
panel opens instead of nothing happening.

Closed, it costs nothing at all: capture is raised only while the viewer is open, and put back when it
closes.

**Pause** freezes the view so it can be read without moving; events keep being recorded and arrive when it
resumes.
**Clear trace** empties the ring in the running application, not just the view, and **keep** changes how
big that ring is without leaving the panel.

**Save as** takes two things out of the page:

- **Trace** `.json` — the trace itself, in the format the viewer reads. It writes the rows that are *on
  screen* — what your filters left, not the whole ring — and says how many those are before you pick it,
  so clear the filters first if you want everything. Drop the file back on a panel, or on
  `docs/tools/trace-viewer.html` opened straight from disk, and it comes up where you left it: same clock
  times, same ring size.
- **Graph** `.svg` — the wiring diagram as a standalone picture, at life size and folded the way you have
  it, carrying its own styles and the colours of the theme you are reading it in. Save it from any view;
  it is drawn when you ask for it.
  It is what is on the *screen*: folded where you folded it, and without whatever the component filter or
  **on screen only** has taken off. What it does not follow is the kinds, the text box or the strip's
  range — those decide the wiring, not the components.
  The **tooltips come with it**. Point at a box, a bus line or a binding in the saved file and the browser
  shows the same words the viewer does, as its own plain-text tooltip; the pointer turns to a question
  mark over anything that has one. It is a picture, not a program — there is no script in the file — so
  the tooltip is the browser's, with the browser's pause before it, and it will not appear if the file is
  used as an `<img>` rather than opened.

`UECA.trace.save()` is still there for saving from your own code, or from the console, and it writes the
whole ring rather than a view of it.

A refresh keeps your place, and keeps your filter: the search text, the kinds, the components, the folded
parts of the tree and the scroll position all survive it. Only the records change.

A trace opens on five of the sixteen kinds: `bus`, `bind`, `prop` and `render` — one reaction read end
to end — and `diag`, which is what you came for when something went wrong. The other eleven are the
framework's own bookkeeping and the lifecycle it ran, and on a real capture they outnumber these several
times over; shown by default they bury the reaction you are reading under the machinery that carried it.
**Clear filters** switches every kind on, all sixteen — clearing a filter means taking it off, and those
five are a default rather than something you set. Clicking the **reactions** group name is the way back to
most of them.

**Kinds** opens the list of them. Each kind is a solid chip in that kind's colour — the same way it is
drawn on every row of the table — with a bar under the label showing how much of the trace that kind is,
measured against the busiest one. The list is therefore also a reading: the chip whose bar is full is what
is flooding the recording, and in live mode it swells in place as a storm begins. Clicking a chip switches
that kind off; an off chip keeps its shape and goes grey, so you can see what is on and what is off
without reading a single label.

Components are picked from **Components**, which opens the application’s own tree with a search box above
it: type a name to find the component, then `only` to show it or `hide` to take it away. Several go in
each list, they need not share an owner, and each brings everything under it.

Hiding is what you do *inside* what you are showing — show a screen, then hide the one child in it that
drowns out the rest — so once something is being shown, only the components inside it can be hidden and
the rest of the `hide` buttons go dim. Give up showing that screen and the hides inside it go with it.
**Clear** at the foot of the picker puts the components back and leaves the text and the kinds alone;
**Clear filters** in the bar puts back all of them, the time range included.

The panel does not appear in its own trace. It is a plain React component with no model of its own, so
what it shows is your application and nothing else.

The table gives each part of a log line its own column, so a **details** column shows what the event
actually carried: the old and new value for a property change or a binding sync — and for a binding, which
of its two bonds carried it and whether that bond can carry one back — the message, what the
record is within its dispatch and the correlation id for a bus event, the owning cache for a cache event,
the hook for a render bracket, and for a render, which of that model's renders this one is. Click any of those to filter
to it. The filter box takes plain text and `field:value` terms — `cast:1`, `prop:port`, `kind:render`,
`level:error` — which match one field exactly, so `cast:1` does not also bring back `cast #10`. Press `/`
to put the caret in that box from anywhere on the page, and `Escape` to empty it again.

A sent message says which of the three methods dispatched it, with what it was aimed at when it was aimed
at anything — `unicast`, `broadcast`, `broadcast=app.ui.*`, `castTo=app.localStorage` — and its handle and
its completion take the same slot, as `handle` and `return[1]`, so one dispatch reads straight down the
column. `return[0]` is a message nobody was listening for. The three are three
different contracts, so this is part of the logic being traced: a broadcast takes any number of
subscribers, while a castTo and a unicast throw on more than one. `via:unicast` narrows the trace to one
of them, and brings the handles and the completion along with the send.

The tree gives each component a bar of its own events coloured by kind, scaled against the busiest
component on screen, so the component that renders too often is the one with the widest blue bar. Clicking
a row folds it and does nothing else; scoping the rest of the viewer to a component is the `only` and
`hide` buttons on the row, which are the same two lists **Components** holds.

Times are shown as a clock — `22:36:11.802` — rather than as milliseconds since the page loaded. On the
timeline, as on the strip above it, each stretch of quiet is compressed to a narrow band labelled with the
time it stands for, which is what makes a real trace readable: an application works in bursts and waits in
between, and on a plain time axis the waiting takes all the width. The time axis always fits the pane, so
to separate the events inside one burst, narrow the scope on the strip and every view follows.

What runs off the pane is the **lanes**, one per model and no end of them on a real application. Scroll or
drag to move down, and the overview at the corner draws the whole plot with the part on screen outlined —
click anywhere on it to look there. A yellow dot on it is the event the play head is standing on, so when
you have moved away from the head you can see where it went and go back to it in one click. The time axis
and the lane names stay put as you go.

## Log Structure

When `traceLog` is enabled, UECA outputs detailed logs to the browser's console. Each log entry captures a specific event, such as:

- **Model Creation**: When a new component model is instantiated.
- **Property Changes**: Updates to component properties.
- **Lifecycle Events**: Hooks like `constr`, `init`, `mount`, `unmount`, `deinit`, `draw`, and `erase`.
- **Rendering**: When a component's view is rendered.
- **Binding Synchronization**: When a value arrives through a property binding rather than by assignment.
- **Message Dispatch**: When a bus message is sent, handled by each subscriber, and completed. The send
  and the completion both name the component that made the call — a completion belongs to the sender,
  being the moment every handler has settled and its `await` resolves. Every model holds its own view of
  the bus, so `model.bus` knows who is sending without anything being passed at the call site; a message
  sent from outside a component has no sender to name. This is what lets the sequence diagram draw a
  dispatch as a call and a return — a solid arrow from the sender to the handler, a dashed one back when
  it completes — rather than as three separate marks that all read alike. What has no sender falls back to
  a lane named *(unknown sender)*, so the record still has somewhere to sit and says plainly why.

Every log entry includes:
- **Event Type**: The action being logged (e.g., `create model`, `change prop`).
- **Model ID**: A unique identifier for the component model (e.g., `model=#123456`).
- **Path**: The component’s hook name or its full path in the parent-child hierarchy (e.g., `useButton` or `app.ui.mainForm.button`).
- **Details**: Specifics like property values or changes (e.g., `"localhost"➝"127.0.0.1"`).

### Example Log

Here’s a sample log from changing a property in an input component:

```plaintext
change prop model=#817544 path=app.ui.appRouter.appLayout.router.generalScreen.postgresHostInput[value] "localhost"➝"127.0.0.1"
render view model=#817544 path=app.ui.appRouter.appLayout.router.generalScreen.postgresHostInput
```

- **Event**: Property change (`change prop`).
- **Model ID**: `#817544`.
- **Path**: `app.ui.appRouter.appLayout.router.generalScreen.postgresHostInput`.
- **Details**: The `value` property changed from `"localhost"` to `"127.0.0.1"`, triggering a re-render.

Another example, showing the creation and initialization of a button component:

```plaintext
create model=#123456 path=useButton
init model=#123456 path=app.ui.mainForm.button
change prop model=#123456 path=app.ui.mainForm.button[caption] ""➝"Click Me"
render view model=#123456 path=app.ui.mainForm.button
```

- **Events**: Model creation, initialization, property change, and rendering.
- **Model ID**: `#123456`.
- **Path**: Transitions from `useButton` to `app.ui.mainForm.button` as the component is integrated into the application hierarchy.

## Benefits for Developers

- **Traceability**: Easily track which component and property changed using `model=#<id>` and `path`.
- **Debugging Ease**: Observe the sequence of lifecycle events (`constr`, `init`, `mount`, etc.) to diagnose issues.
- **State Clarity**: Monitor property updates to verify reactive behavior.
- **Testing Support**: Combine with `model.fullId()` to map logs to specific components for automated tests.

## Reading the Log

To interpret a log entry:
1. **Identify the Event**: Determine the action (e.g., `change prop`).
2. **Check the Model ID**: Use `model=#<id>` to follow a specific component across events.
3. **Note the Path**: Understand the component’s location in the application hierarchy.
4. **Review Details**: See what changed or what action was performed.

For example:

```plaintext
change prop model=#817544 path=app.ui.appRouter.appLayout.router.generalScreen.postgresHostInput[value] "localhost"➝"127.0.0.1"
```

- **Event**: Property change.
- **Model ID**: `#817544`.
- **Path**: Indicates the component is an input field on the `generalScreen`.
- **Details**: The `value` property was updated, likely due to user input.

## Best Practices

- **Enable During Development**: Use `traceLog: true` during development or debugging to gain insights.
- **Disable in Production**: Set `traceLog: false` in production to avoid console clutter and improve performance.
- **Filter by Model ID**: Search logs for a specific `model=#<id>` to focus on one component.
- **Combine with Component IDs**: Use `model.fullId()` (e.g., `app.ui.mainForm.button`) to map logs to your component hierarchy.

With UECA’s tracing system, you can gain a clear window into your application’s behavior, making development and debugging more efficient.