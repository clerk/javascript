---
id: 6
title: 'Validate host-supplied paths where they enter, not in the codec'
summary: "A custom page's path must be exactly its segment: no stray slashes, no leading colon, no percent-encoding, not a built-in page's segment. One that is not is left out with a warning saying what to write. The codec still throws on a bad pattern, because that is Mosaic's own bug."
status: accepted
implementation: shipped
implementation_note: 'withRoutablePaths in src/features/profile-pages/profile-pages.layout.ts.'
date: 2026-11-06
authors:
  - 'Fredrik Höglund <fredrik@clerk.dev>'
tags: [profiles, security]
supersedes: null
superseded_by: null
---

## TL;DR

Custom page paths are configuration, but they become pattern literals and are compared raw as page ids. `withRoutablePaths` drops a path that is not written as its own segment (a leading, trailing or doubled slash, or an empty path), one that starts with a colon, one that is percent-encoded, and one that equals the segment of one of the profile's built-in pages where that segment differs from the id, such as `api-keys`. Each warning names the path and, where there is one, the spelling to use. Spaces and non-ASCII are fine. The codec's own assertion stays, for patterns Mosaic writes.

## Context

Before this, a host passing `customPages={[{ path: 'my page' }]}` threw inside render with no boundary, where `main` rendered it. A path starting with a colon silently became a param. A path equal to `api-keys` compiled to the same pattern as the built-in and was unreachable. Review then found that `security/` and `/security` passed the raw-string duplicate check while compiling to the same parts as the built-in, and that a built-in table shared between the profiles made the organization profile reject `organization/api-keys`, a page only the combined user profile has. Legacy warns and continues for duplicate paths.

Rejected: throwing in production for a host typo, which takes down the whole profile over one unreachable tab. Correcting instead of rejecting was considered for the slash and built-in-segment cases, where the fix is unambiguous; it needs the same canonicalisation applied to `pageOrder` and the modal `page` option, and was left as a warning for now. Open: throwing in development only, which the package does elsewhere.

## Decision

Reject at the edge with a warning that says what to write, checked per profile against its own built-in pages; keep the codec strict for Mosaic's own patterns.

## Consequences

- A bad custom page is hidden rather than shown unroutable, which is a visible change for hosts using such paths.
- The literal rule in [MEDR-0002](./0002-names-in-parts-out.md) is the one the edge enforces.

## References

- `src/features/profile-pages/profile-pages.layout.ts`
- `src/features/user-profile/__tests__/user-profile.layout.test.ts`

## Changelog

- **2026-11-06**: Accepted.
- **2026-11-06**: Amended after review: paths checked as segments against the profile's own built-ins; messages reworded.
