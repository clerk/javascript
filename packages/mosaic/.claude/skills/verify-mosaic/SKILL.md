---
name: verify-mosaic
description: Drive @clerk/mosaic components and flows in swingset, the Mosaic component explorer (Next.js dev server in packages/swingset), through an isolated agent-browser session, and capture ARIA snapshots, screenshots, and DOM attribute dumps as evidence. Use it to prove a change to packages/mosaic or packages/swingset works in a real browser before calling it done, to reproduce a Mosaic UI bug, or to check knobs, overlays, RTL, chaos data, and dark mode on a component page.
---

# verify-mosaic

`bin/control-swingset` (beside this file) starts swingset for this worktree, checks it, gives you an `agent-browser` session that no other worktree shares, makes evidence folders, and tears it all down. Swingset reads Mosaic from `packages/mosaic/src`, so a Mosaic edit shows up on reload without rebuilding `@clerk/mosaic`.

A change to Mosaic UI is not done until a browser shows the changed behaviour on the page that documents it. Unit and browser-mode tests in `packages/mosaic` prove the code. This skill proves what a user sees.

Run every command from the repo root. Below, `CS` means `packages/mosaic/.claude/skills/verify-mosaic/bin/control-swingset`.

## Launch

Once per machine: install `agent-browser` 0.27 or newer (`brew install agent-browser`). Read `agent-browser skills get core` once if you have not used it.

Once per worktree, after `pnpm install`:

```console
$ pnpm turbo build --filter='@clerk/swingset^...'
$ CS up
start   pid 3722  log <repo>/packages/mosaic/.verify/swingset.log
listen  http://localhost:6008
ready   http://localhost:6008/components/button  session verify-mosaic-057349b4
```

- `up` runs `packages/swingset/scripts/dev.mjs`, which takes port 6006 or the next free one. Other worktrees often hold 6006 and 6007, so always use the port `up` prints, or `CS url`.
- Ready means `/components/button` returned 200, which forces the first compile (about 20s cold).
- `up` reuses an instance this worktree already started. It refuses when a swingset that it did not start is running in this worktree, because the two would share `packages/swingset/.next`.
- `up` refuses when `@clerk/nextjs` or `@clerk/shared` has no `dist/`, and prints the build command.

## Doctor

Run it first, and again whenever anything looks off. It only reads.

```console
$ CS doctor
ok    agent-browser installed (agent-browser 0.27.0)
ok    state file <repo>/packages/mosaic/.verify/instance.env
ok    process 3722 alive
ok    port 6008 served from this worktree (<repo>/packages/swingset)
ok    http://localhost:6008/components/button returns 200
ok    started at HEAD 9f579d368f (now 9f579d368f)
info  session verify-mosaic-057349b4
```

Each `FAIL` line has a `fix`. The exit code is 1 when any check fails.

## Drive

`CS ab <args>` is `agent-browser --session verify-mosaic-<hash>` for this worktree. Never call bare `agent-browser`: its `default` session can belong to another agent.

```console
$ CS ab open "$(CS url /components/dialog)"
$ CS ab snapshot -i                      # interactive elements with @refs
$ CS ab find role button click --name "Open dialog"
$ CS ab wait '[role=dialog]'
$ CS ab eval '(() => document.querySelector("[role=dialog]").dataset.variant)()'
```

Conventions:

- Routes are `/<group-slug>/<component-slug>`: `/components/button`, `/components/dialog`, `/user-button/user-button`, `/misc/organization-switcher`. The slug is the story's `meta.group` and `meta.title` run through `packages/swingset/src/lib/slug.ts`. A wrong path still returns 200 with `No docs found`, so check the level-1 heading. Read the paths of the expanded sidebar groups with `CS ab eval '(() => [...document.querySelectorAll("[data-sidebar] a")].map(a => a.getAttribute("href")))()'`, or click the link with `CS ab click 'a[href="/user-button/user-button"]'`.
- Prefer role and accessible name (`find role button --name …`). When `find` cannot resolve a name, as with the header switches, take `snapshot -i` and use the `@ref`. Refs change after every navigation and every re-render, so take a new snapshot first.
- Mosaic parts carry their identity in the DOM: a `.cl-<slot>` class plus `data-<axis>` attributes (`data-variant`, `data-size`, `data-color`, `data-open`). Assert on those, not on computed colours or class hashes. `data-style-src` lists the StyleX source lines that styled the element.
- Wrap every `eval` body in an IIFE. The page keeps `const`s between `eval` calls, and a second `const b` throws.
- Wait on an element (`CS ab wait '<selector>'`), never on `wait --url`. Swingset navigates on the client, and `wait --url` hangs until its timeout.
- `agent-browser` has no per-command timeout. Give the Bash call its own timeout.
- If a command hangs or prints `CDP response channel closed`, run `CS ab close`, then `CS doctor`, then start the recipe again from `open`. Doctor checks the server, not the browser, so a hung browser still shows all `ok`.
- Set the viewport with `CS ab set viewport <w> <h>` before `open`. Changing it on a loaded page can drop the browser connection.
- When you pull a ref out of a snapshot with `grep`, match `e[0-9]\+`. A bare `e[0-9]*` also matches the `e` in `ref`.

Read [`notes.md`](notes.md) before driving. It says what to prove for a primitive, a component, a feature, or a Live Sandbox change. When a note turns out to be wrong, fix it in the same PR.

## Evidence

```console
$ E=$(CS evidence dialog-open)            # packages/mosaic/.verify/evidence/<utc>-dialog-open
$ CS ab snapshot > "$E/open.aria.txt"
$ CS ab screenshot "$E/open.png"
$ CS ab eval '(() => Object.fromEntries([...document.querySelector("[role=dialog]").attributes].map(a => [a.name, a.value])))()' > "$E/open.attrs.json"
```

Proof standards:

- Drive the user path: click, type, and press keys on the page. Do not set React state or call story functions from `eval`. Use `eval` only to read.
- Capture the action and the state it produced: before and after for a toggle, open and closed for an overlay, the knob value and the preview attribute for a prop.
- Prove the check can fail. Save your diff to a file, undo the change, confirm the undo took effect, run the same commands into a `CS evidence <feature-id>-control` folder, and show the result differs. Then apply the diff again and run the check once more. A check that passes with and without the change proves nothing.
- A screenshot alone proves nothing about state. Pair it with the ARIA snapshot or the attribute dump that shows the claimed value.
- For a styling change, check both themes (`Dark mode` switch) and RTL when the change touches layout.
- Name the feature file and entry point you used. Report every entry point you could not reach, and why, instead of claiming it through another one.
- Evidence lives in `packages/mosaic/.verify/evidence/`, which git ignores. `CS down` keeps it.

## Attach

Once the branch is pushed and has a pull request, put the screenshots in its description:

```console
$ CS attach "$E" --pr <n> --before "$CONTROL"
attached 3 screenshots with befores to https://github.com/clerk/javascript/pull/<n>
```

- It writes a block between `<!-- verify-evidence:mosaic -->` and `<!-- /verify-evidence:mosaic -->`. A line names the evidence folders and the pull request's head commit. With `--before`, a table shows each control screenshot beside the screenshot of the same name. Without it, the screenshots sit two across under their names.
- Run it again to replace the block. Nothing outside the markers changes.
- It refuses when local `HEAD` is not the pull request's head, when a marker appears twice or alone, when the markers hold text it did not write, or when the description ends in an unclosed code fence. Markers inside a code fence do not count.
- `--before` keeps only the screenshots both folders have, and names each one it skips.
- It needs `gh` 2.99 or newer for `gh pr edit --attach`. `--dry-run` prints the command without changing the pull request.
- Only `.png` files go up. ARIA snapshots and attribute dumps stay local; quote the line that proves the claim in the description instead.

## Cleanup

```console
$ CS down
closed  browser session verify-mosaic-057349b4
stopped pid 3722
kept    evidence in <repo>/packages/mosaic/.verify/evidence
```

`down` closes only this worktree's browser session and stops only the process `up` started. It never kills by process name. Run it after a failed attempt too. A failed `up` runs it for you.

## Not covered

- The Live Sandbox (`/live`, `/sign-in`, `/sign-up`) needs `packages/swingset/.env.local` with a publishable key. Without it, report Live Sandbox paths as skipped. See [`notes.md`](notes.md).
- The Playwright suite for Mosaic in a real Next.js app (`pnpm test:integration:mosaic`, tests in `integration/tests/mosaic/`) needs the team's integration secrets. This skill does not run it.
