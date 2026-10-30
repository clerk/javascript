---
name: studio-ideas-refresh
description: >-
  Bring the swingset studio showcase ideas list (`packages/swingset/src/studio/ideas.json`) up to
  date from merged Mosaic PRs on GitHub. Use when someone asks to refresh, update, or regenerate the
  showcase or demo suggestions, or when `studio-ideas` reports the list is stale.
---

# Refresh studio ideas

Turn merged PRs into demo ideas for the studio. The file format is in the `studio-ideas` skill.

## 1. Collect PRs

Read `mergedAfter` from `ideas.json`, then:

```sh
gh pr list --repo clerk/javascript --state merged --limit 200 \
  --search "merged:>=<mergedAfter date> -label:dependencies" \
  --json number,title,mergedAt,body,files,labels
```

If it returns 200, the window is truncated: rerun with a `merged:<start>..<end>` range per week until
each returns fewer. Keep PRs that merged after `mergedAfter` and touched `packages/mosaic/` or `packages/ui/`. Drop
`chore`, `ci`, `docs`, `test`, and `Version packages` PRs. Skip any PR already listed in an idea,
including `built` and `dismissed` ones.

## 2. Judge each PR

The question is whether a 10–30 second silent video of the change would make a front-end developer
stop scrolling. Use the title and body first, then `gh pr diff <n>` when you can't tell.

- **Strong**: a new component or flow, visible motion, a gesture or interaction, a before/after that
  reads at a glance (a layout no longer breaking, a flicker gone).
- **Good**: a visual polish pass, a new variant or prop with a visible effect, a mobile or dark-mode
  improvement.
- **Maybe**: a real improvement that needs a caption to land (contrast, spacing, error copy).
- **Skip**: refs, types, routing, state machines, test or build changes, anything with no pixels.

Group PRs that tell one story into one idea (the Table primitive and the styled Table rebuilt on it
are one demo). If a new PR extends a `new` or `building` idea, add it to that idea's `prs` instead of
making another.

## 3. Write ideas

For each new idea, write `title` (what the viewer sees, not the PR title), a one-line `pitch`, 2–4
`beats` that map onto studio steps, and a `layout`:

- `code` or `split` when the API is the point (a new prop, a composable part).
- `component` when the behavior is the point (motion, gestures, flows).

Default `format` to `landscape`. Use `portrait` for mobile and sheet work.

Check `packages/swingset/src/studio/showcases/` and skip ideas an existing showcase already covers.

Append the new ideas to the end of the array, never reorder or rewrite existing ones, and set
`mergedAfter` to the newest `mergedAt` you saw (including skipped PRs). Finish by listing the new
ideas the way `studio-ideas` pages them, plus a count of PRs skipped, and remind the user that the
file needs committing.
