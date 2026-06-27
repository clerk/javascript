# Claude Code skills

This directory holds [Claude Code skills](https://code.claude.com/docs/en/skills) that ship with the
repo. Skills are how-to playbooks the agent loads on demand. They complement `AGENTS.md` (the
canonical rules, read automatically by most coding agents) with step-by-step recipes.

## How a skill is activated

There is nothing to install or enable. Anyone who checks out this repo and runs Claude Code in it
gets every skill in this directory automatically:

1. At session start, Claude only sees each skill's frontmatter `description`. This costs almost no
   context.
2. When a request matches that description (for `clerk-monorepo`: setting up the repo, building or
   testing a package, changesets, commit conventions, breaking-change questions), Claude loads the
   full `SKILL.md` body on its own.
3. You can also invoke a skill explicitly by typing `/clerk-monorepo` in the prompt. `/skills` lists
   everything available.
4. Files under `references/` are read only when the loaded skill points at them, so deep-dive
   content stays out of context until it is needed.

Edits to a `SKILL.md` take effect immediately, including in already-running sessions.

## Scope

Skills are Claude Code specific. Cursor does not read this directory; it uses `.cursor/rules/` and
`AGENTS.md`. When a repo rule changes, update `AGENTS.md` first, then mirror the change here and in
`.cursor/rules/` where relevant.

## Maintaining a skill

- `AGENTS.md` is the authority. If a skill disagrees with it, fix the skill.
- Keep `SKILL.md` lean; the whole body enters context when the skill triggers. Push detail into
  `references/*.md`, which load on demand.
- Write the frontmatter `description` as the trigger: it is the only part the model sees up front,
  so it should say _when_ to use the skill, not just what it contains.
- Skills contain factual claims about the repo (scripts, package lists, CI behavior). When you
  rename a script, add a package, or change a workflow, grep this directory for stale mentions.
- `pnpm format` does not cover `.claude/`. Format skill files with
  `pnpm prettier --write '.claude/**/*.md'`.

## Skills in this repo

| Skill            | Use it for                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `clerk-monorepo` | Day-to-day work in the monorepo: setup, build/test loops, the package map, changesets, commits, PRs, breaking-change checks. |
