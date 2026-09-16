#!/usr/bin/env node
// Copies the agent skills shipped in this package into a project, where an AI coding agent will find
// them. `npx ueca-react-skills`.
//
// This package installs NOTHING on its own: there is no postinstall hook, and requiring ueca-react runs
// no code that touches your project. Getting the skills is a command you run, or a line you choose to
// put in your own package.json. That is deliberate — a library writing agent instructions into a project
// as a side effect of `npm install` is the kind of thing supply-chain tooling blocks, and it would be
// skipped anyway by --ignore-scripts, by ignore-scripts in .npmrc, by pnpm outside its allowlist and by
// Bun outside trustedDependencies. A step that works for some installs and silently not for others is
// worse than one you invoke.
//
// The default destination is .claude/skills, which is where Claude Code looks. --dest writes them
// anywhere else instead: the skills themselves are plain Markdown about the UECA component pattern and
// name no tool, so any agent that reads a directory of Markdown can use them. Only the SKILL.md
// frontmatter — a `name` and a trigger-shaped `description` — is written for Claude Code's on-demand
// loading; another tool may ignore it or want something different.
//
// The copy is GENERATED: each skill directory is removed before it is written, so a file dropped from a
// later release does not linger. Only directories this package owns are touched — anything else in the
// destination belongs to the project and is never read, moved or deleted.
//
// --auto is for a postinstall of your own. Its one job is to never fail the install: whatever goes
// wrong, it exits 0. Everything else behaves as a normal run.

import { readdirSync, existsSync, rmSync, cpSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(PKG, 'skills');
const DEFAULT_DEST = join('.claude', 'skills');

const argv = process.argv.slice(2);
const auto = argv.includes('--auto');

// --dest <path> or --dest=<path>
function flag(name) {
    const eq = argv.find(a => a.startsWith(name + '='));
    if (eq) return eq.slice(name.length + 1);
    const i = argv.indexOf(name);
    return i >= 0 ? argv[i + 1] : undefined;
}

if (argv.includes('--help') || argv.includes('-h')) {
    console.log(`
  ueca-react-skills — copy this package's agent skills into your project

  Usage
    npx ueca-react-skills                      copy into ./.claude/skills, creating it if needed
    npx ueca-react-skills --dest <path>        copy into <path> instead
    npx ueca-react-skills --auto               same, but never exit non-zero (for your own postinstall)

  --dest takes a path relative to the project (or an absolute one), for an agent that reads its
  instructions somewhere other than .claude/skills. The skills are tool-neutral Markdown; only the
  SKILL.md frontmatter is shaped for Claude Code, and another tool may simply ignore it.

    npx ueca-react-skills --dest .cursor/rules
    npx ueca-react-skills --dest docs/agent

  The copy is generated. Re-run it after upgrading ueca-react rather than editing it in place, and
  keep the destination out of version control if you would rather not track a generated tree.

  This package ships no postinstall and installs nothing by itself. To keep the copy in step with
  upgrades, put it in your own package.json:

    "postinstall": "ueca-react-skills --auto"
`);
    process.exit(0);
}

const done = (code) => process.exit(auto ? 0 : code);   // --auto must never fail an install

// ---------------------------------------------------------------------- the copy

const skillNames = existsSync(SOURCE)
    ? readdirSync(SOURCE, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name)
    : [];

if (!skillNames.length) {
    console.error('ueca-react-skills: this package ships no skills/ directory.');
    done(1);
}

// Present-but-valueless must fail rather than quietly fall back to the default: a postinstall written
// as "--auto --dest" would otherwise maintain a directory nobody asked for.
const destGiven = argv.some(a => a === '--dest' || a.startsWith('--dest='));
const destValue = flag('--dest');
if (destGiven && (!destValue || destValue.startsWith('-'))) {
    console.error('ueca-react-skills: --dest needs a path, e.g. --dest .cursor/rules');
    done(1);
}
const dest = destValue ?? DEFAULT_DEST;

// npm runs a project's own scripts with the project root as cwd, so this is right for a manual run and
// for a postinstall alike.
const root = process.cwd();
const target = isAbsolute(dest) ? dest : resolve(root, dest);

// Writing into the package would mean the next install copies a copy.
const inside = relative(PKG, target);
if (inside && !inside.startsWith('..') && !isAbsolute(inside)) {
    console.error(`ueca-react-skills: refusing to write inside the package itself (${target}).`);
    done(1);
}

const countFiles = (dir) => readdirSync(dir, { withFileTypes: true })
    .reduce((n, e) => n + (e.isDirectory() ? countFiles(join(dir, e.name)) : 1), 0);

mkdirSync(target, { recursive: true });

const report = [];
for (const name of skillNames) {
    const from = join(SOURCE, name);
    const to = join(target, name);
    const existed = existsSync(to);

    // Remove first, so a file dropped in a later release does not survive the upgrade. Only ever the
    // named skill directory — never the destination itself, whatever --dest points at.
    if (existed) rmSync(to, { recursive: true, force: true });
    cpSync(from, to, { recursive: true });

    report.push(`  ${name.padEnd(24)} ${existed ? 'updated' : 'installed'}  (${countFiles(to)} files)`);
}

const version = JSON.parse(readFileSync(join(PKG, 'package.json'), 'utf8')).version;
const shown = isAbsolute(dest) ? target : relative(root, target) || '.';
console.log(`\nueca-react ${version} skills -> ${shown}`);
report.forEach(line => console.log(line));
console.log(`
  The copy is generated - re-run this after upgrading rather than editing it in place.
  Point your agent instructions at them so they are reached before any UECA code is written.
`);
