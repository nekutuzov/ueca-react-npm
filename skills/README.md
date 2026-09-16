# Skills shipped with UECA-React

Agent skills for building applications **on** UECA-React. They describe the published API only — no
library internals — so they stay valid for any consuming project.

| Skill | Covers |
| --- | --- |
| [`ueca-app-development`](./ueca-app-development/) | **writing UECA code** — a component, a group of components, or a feature: the struct/hook/`getFC` pattern, state and bindings, lifecycle, model caching, the message bus, and a symptom-indexed pitfalls list |
| [`ueca-app-architecture`](./ueca-app-architecture/) | **standing up or converting a whole application** — the complete barebone scaffold (bootstrap, base-hook chain, shell, router, services, screens), the infrastructure modules that go on top of it, where each concern belongs, a staged plan for migrating an existing React app, and an index of the published reference applications |

Start with `ueca-app-architecture` on a new or migrating project, and `ueca-app-development` for the
day-to-day work inside it. The second assumes the first; the first builds on the second.

You do not have to go all the way. `ueca-app-architecture` describes three paths, and **Path C —
writing UECA components inside an application that stays React — is a supported end state**, not a
stalled migration.

Both skills point at [three complete published applications](./ueca-app-architecture/reference/reference-apps.md).
Before writing a control, a service or a screen from scratch, check whether one already exists there:
[demo2](https://github.com/nekutuzov/ueca-react-app-demo2) alone carries some fifty components with
their tests. The full framework documentation ships in the same package, at
`node_modules/ueca-react/docs/raw/index.md`.

## Installing into your application

```bash
npx ueca-react-skills
```

That is the whole thing. The skills ship inside the npm package at `node_modules/ueca-react/skills/`,
Claude Code discovers them under `.claude/skills/`, and the command bridges the two.

It **replaces** each skill directory rather than merging into it, so a file dropped in a later release
does not survive the upgrade. It touches only the directories this package owns — your own skills in
`.claude/skills/` are never read, moved or deleted. Run it again after upgrading `ueca-react`.

`npx ueca-react-skills --help` prints the options.

### Nothing happens on install

This package ships **no postinstall hook**. Installing `ueca-react` runs no code that touches your
project; the skills arrive when you run the command and not before.

That is deliberate. A library writing agent instructions into a project as a side effect of
`npm install` is the kind of thing supply-chain tooling blocks, and it would be skipped anyway by
`npm install --ignore-scripts`, by `ignore-scripts=true` in `.npmrc`, by pnpm unless the package is
allowlisted, and by Bun outside `trustedDependencies`. A step that runs for some installs and silently
not for others is worse than one you invoke.

To keep the copy in step with upgrades, put it in a postinstall of **your own**, where `--auto` means
"never fail the install":

```json
"scripts": {
    "postinstall": "ueca-react-skills --auto"
}
```

### Keeping it out of git

The copy is **generated**. Either ignore it:

```gitignore
.claude/skills/ueca-app-development/
.claude/skills/ueca-app-architecture/
```

…or commit it and re-run the command after each upgrade. Do not edit it in place either way — your own
project skills layer on top, and they win where they disagree.

### Another agent, another directory

`.claude/skills` is where Claude Code looks. `--dest` writes them anywhere else instead:

```bash
npx ueca-react-skills --dest .cursor/rules
```

The skills are tool-neutral Markdown about the UECA component pattern — they name no tool and assume no
runtime. Only each `SKILL.md`'s frontmatter is shaped for Claude Code, a `name` and a trigger-worded
`description` for loading a skill on demand; an agent that does not work that way will read past it, and
one that concatenates its rules into context will simply take the prose.

The same rules apply wherever it writes: each skill directory is replaced rather than merged, and
anything else in the destination is left alone. `--dest` refuses to write inside the package itself, and
fails rather than falling back if you give it no path.

A postinstall of your own takes the same flag:

```json
"scripts": {
    "postinstall": "ueca-react-skills --auto --dest .cursor/rules"
}
```

### Without the command

A symlink tracks the installed version with no copy step at all:

```bash
ln -s ../../node_modules/ueca-react/skills/ueca-app-development .claude/skills/ueca-app-development
ln -s ../../node_modules/ueca-react/skills/ueca-app-architecture .claude/skills/ueca-app-architecture
```

On Windows, `mklink /D` or `New-Item -ItemType SymbolicLink` does the same. A plain
`cp -r node_modules/ueca-react/skills/* .claude/skills/` also works, but it merges rather than replaces,
so a file removed in a later release stays behind.

## Pointing your agent instructions at it

Copying the files is half of it. Your agent also has to know they are there, and reach them *before* it
writes UECA code rather than after the first attempt fails.

Put one of the two blocks below in whatever file your agent reads first — `CLAUDE.md`, `AGENTS.md`,
`.github/copilot-instructions.md`, a rule file, a system prompt. Which block depends on one thing only:
whether your agent can decide to open a file on its own.

**If it loads instructions on demand** — it sees a catalogue of skills and picks one when the task calls
for it. Name them and say when:

```markdown
This project is built on the UECA-React library.

- Use `ueca-app-development` before creating or changing any component, screen or service — it carries
  the component pattern and the failure modes that make UECA code break silently.
- Use `ueca-app-architecture` for anything bigger than one component: the app shell, routing, services,
  "where does this go", or converting existing React code to UECA.
```

**If it does not** — everything it knows arrives in one blob of context. A skill *name* means nothing to
it, so give it paths and a reason to open them, and adjust the paths to wherever you installed them:

```markdown
This project is built on the UECA-React library. UECA components are not React components with a
different accent, and most mistakes are React habits carried across — so before writing any of it:

- Read `.claude/skills/ueca-app-development/SKILL.md` before creating or changing a component, screen
  or service, and `reference/pitfalls.md` beside it when something already misbehaves.
- Read `.claude/skills/ueca-app-architecture/SKILL.md` for anything bigger than one component — the app
  shell, routing, services, or converting existing React code.

Do not use `useState`, `useEffect`, `useContext`, `useReducer` or class components in this project.
```

That last line is worth keeping whichever block you use: it is the rule an agent breaks first, and it is
cheap to state up front rather than leaving it to be discovered in a file the agent may not open.

Your own project skills layer on top of these: where they describe your app's base hooks, layout
primitives or screen conventions, they are more specific and they win. `ueca-app-development` covers
what the library itself guarantees.
