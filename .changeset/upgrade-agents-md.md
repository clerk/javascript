---
'@clerk/upgrade': minor
---

Add an `--agents-md` flag that writes Clerk sections to the project's `AGENTS.md` for each installed Clerk SDK, then exits. In a monorepo, it writes one section per app to the `AGENTS.md` at the repo root. Interactive upgrades also offer to write these sections. Nothing is written when `package.json` sets `"clerk": { "agentsMd": false }`.
