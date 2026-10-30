---
name: studio-ideas
description: >-
  List and page through suggested swingset studio showcases: demo ideas drawn from recently merged
  Mosaic work, stored in `packages/swingset/src/studio/ideas.json`. Use when someone asks what to
  record next, wants to browse, pick, claim, or dismiss showcase ideas, or says "next" while paging
  through them.
---

# Studio ideas

`packages/swingset/src/studio/ideas.json` holds demo ideas for the studio (see the `studio` skill).
`studio-ideas-refresh` fills it from GitHub history; this skill reads it and changes statuses.

```jsonc
{
  "mergedAfter": "2026-10-28T17:02:11Z", // newest merge refresh has seen
  "ideas": [
    {
      "id": "table-row-actions", // kebab-case, stable
      "title": "Tables with row actions and tree rows",
      "pitch": "One line on what the viewer sees and why it's worth watching.",
      "prs": [10414, 10421],
      "mergedAt": "2026-10-21T09:12:00Z", // newest of its PRs
      "strength": "strong", // strong | good | maybe
      "layout": "split", // component | code | split
      "format": "landscape", // landscape | square | portrait
      "beats": ["Open the row menu", "Expand a tree row", "Select three rows"],
      "status": "new", // new | building | built | dismissed
      "showcase": "table-row-actions", // slug, once building
      "notion": "https://…", // ready-to-post page, once built
      "note": "Why it was dismissed, who is building it, …",
    },
  ],
}
```

## Listing

Show `new` ideas first, then `building`, sorted by `strength` (strong, good, maybe) and then by
`mergedAt`, newest first. Leave out `built` and `dismissed` unless asked. Show **5 per page**, numbered
across pages (6–10 on page 2), and end with the page and total count:

```
1. Tables with row actions and tree rows · strong · split
   Open the row menu, expand a tree row, then select three rows: the table primitive doing it all.
   #10414 #10421 · Oct 21

Page 1 of 4 · 18 ideas. "next", "show 3", "build 3", "dismiss 2 <reason>".
```

If the newest `mergedAt` is more than two weeks old, or the list is empty, suggest running
`studio-ideas-refresh` first.

## Actions

- **next / prev / page N**: show that page. Remember the page from the last listing in the conversation.
- **show N**: the full idea, its beats, and each PR's title and link (`gh pr view <n> --json title,url`).
- **build N**: set `status: "building"` and `showcase` to the id, then load the `studio` skill and author
  `src/studio/showcases/<id>.tsx` from the beats. Read the PRs' diffs and existing swingset stories
  for fixtures first.
- **dismiss N <reason>**: set `status: "dismissed"` and `note` to the reason. Refresh never brings back a
  dismissed idea, so a short reason helps whoever reads the list next.
- **reopen N**: back to `new`.

Edit `ideas.json` in place, keep its formatting (two-space JSON), and never reorder the array.
Statuses are shared through the repo, so mention that the change needs committing.
