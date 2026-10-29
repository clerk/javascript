---
'@clerk/upgrade': minor
---

Add an `--agents-md` flag that writes Clerk sections to the project's `AGENTS.md` for each installed Clerk SDK, then exits. Interactive upgrades also offer to write these sections. Nothing is written when `package.json` sets `"clerk": { "agentsMd": false }`.
