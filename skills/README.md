# Skills shipped with UECA-React

Agent skills for building applications **on** UECA-React. They describe the published API only — no
library internals — so they stay valid for any consuming project.

| Skill | Covers |
| --- | --- |
| [`ueca-app-development`](./ueca-app-development/) | **writing UECA code** — a component, a group of components, or a feature: the struct/hook/`getFC` pattern, state and bindings, lifecycle, model caching, the message bus, and a symptom-indexed pitfalls list |
| [`ueca-app-architecture`](./ueca-app-architecture/) | **standing up or converting a whole application** — the complete barebone scaffold (bootstrap, base-hook chain, shell, router, services, screens), where each concern belongs, and a staged plan for migrating an existing React app to pure UECA |

Start with `ueca-app-architecture` on a new or migrating project, and `ueca-app-development` for the
day-to-day work inside it. The second assumes the first; the first builds on the second.

## Installing into your application

The skills ship inside the npm package, at `node_modules/ueca-react/skills/`. Claude Code discovers
skills under `.claude/skills/`, so make them visible there.

**Copy** — simple, and pinned until you copy again:

```bash
cp -r node_modules/ueca-react/skills/* .claude/skills/
```

**Symlink** — always matches the installed version:

```bash
ln -s ../../node_modules/ueca-react/skills/ueca-app-development .claude/skills/ueca-app-development
ln -s ../../node_modules/ueca-react/skills/ueca-app-architecture .claude/skills/ueca-app-architecture
```

On Windows, `mklink /D` or `New-Item -ItemType SymbolicLink` does the same.

A `postinstall` script keeps it in step with upgrades:

```json
"scripts": {
    "postinstall": "node -e \"const s='node_modules/ueca-react/skills';for(const d of require('fs').readdirSync(s,{withFileTypes:true}).filter(e=>e.isDirectory()))require('fs').cpSync(s+'/'+d.name,'.claude/skills/'+d.name,{recursive:true})\""
}
```

If you copy rather than symlink, treat the copy as **generated** — re-copy after upgrading `ueca-react`
instead of editing it in place.

## Pointing your agent instructions at it

Add a line to your project's `CLAUDE.md` so the skill is reached before any UECA code is written:

```markdown
This project is built on the UECA-React library.

- Invoke `ueca-app-development` before creating or changing any component, screen or service — it
  carries the component pattern and the failure modes that make UECA code break silently.
- Invoke `ueca-app-architecture` for anything bigger than one component: the app shell, routing,
  services, "where does this go", or converting existing React code to UECA.
```

Your own project skills layer on top of this one: where they describe your app's base hooks, layout
primitives or screen conventions, they are more specific and they win. `ueca-app-development` covers
what the library itself guarantees.
