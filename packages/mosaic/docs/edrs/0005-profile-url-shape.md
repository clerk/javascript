---
id: 5
title: "Give the profiles legacy's URL shape and no opening-page prop"
summary: "The first page in navigation order is the root with no segment; every other page has legacy's segment, api-keys for apiKeys. Ids stay the API; the mapping lives in the profile layer. There is no defaultPage: a modal opens on the page passed to open."
status: accepted
implementation: shipped
implementation_note: "src/features/profile-pages; the profiles' modal surfaces write pageParts(options.page) on open."
date: 2026-11-06
authors:
  - 'Fredrik Höglund <fredrik@clerk.dev>'
tags: [profiles, compatibility]
supersedes: null
superseded_by: null
---

## TL;DR

`useProfilePagesController` maps every page id through `pageSegment`, which is the one place `apiKeys` becomes `api-keys` and `organization/apiKeys` becomes `organization/api-keys`, and names the first page as the scope's `root`, so it lives at the base and its own segment is canonicalised there. Custom pages use their `path`. While the page ids are unknown, because a model is loading, the controller passes nothing and the profile shows its loading fallback. An inline profile opens on its first page; a modal opens on the page passed to `open`, which the host writes before the content mounts through `initialParts`; in a URL mode the URL says. Reorder with `pageOrder` if another page should come first.

## Context

Existing URL shapes must keep working, and page ids are host-facing props that cannot change. `defaultPage` predated routing: it was the `useState` initial value. Every meaning tried for it with a location either moved the root with availability, which broke the sticky fallback when a page disappears, or needed an "absent entry shows this page" rule that served only the prop. Legacy never had it for inline profiles, and legacy virtual profiles always opened on their first page.

## Decision

First page as root, legacy segments for the rest, mapping in the profile layer, `defaultPage` removed.

## Consequences

- The root page has no named segment, as in legacy, so `/user/account` is not a route when Account is first.
- Opening a modal at the first page writes its segment, which the owner canonicalises to the base. The modal `page` option works for every page, including the first; `open()` with no page lands on the first page directly.
- A host that wants an inline virtual profile to open on another page has no way to say so; the honest shape, if needed, is a write to the location from outside, not a prop.
- The breaking changeset for the prop removal ships with this branch.

## References

- `src/features/profile-pages/profile-pages.controller.ts`, `profile-pages.layout.ts`
- Legacy: `packages/ui/src/components/UserProfile/UserProfileRoutes.tsx`

## Changelog

- **2026-11-06**: Accepted.
- **2026-11-06**: Amended after review: the first page is the scope's `root`; unknown page ids show the fallback instead of routing.
