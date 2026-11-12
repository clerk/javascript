# Mosaic routing EDRs

Engineering Decision Records for routing in `@clerk/mosaic`: one file per decision, with the context that led to it and the consequences accepted. [Routing](../routing.md) is the synthesis of these records for someone using routing; the records are the source of truth for someone changing it.

This follows [clerk/edr](https://github.com/clerk/edr) and the Protect variant, trimmed to what a package needs: no site, no review window. Merging the PR that carries a record is its acceptance, because the record and the code ship together.

## Create a record

1. Pick the next free number: `ls`. Numbers are never reused.
2. Copy `template.md` to `NNNN-short-kebab-slug.md`.
3. Fill in the frontmatter. `summary` is at most 240 characters and is read far more often than the body; write it last. `implementation` says what exists on `main` today, not what the decision asks for.
4. Write TL;DR, Context, Decision, Consequences. Keep it to about a screen. Rejected alternatives go in Context, so they are not retried.
5. Cite other records as `[MEDR-NNNN](./NNNN-slug.md)`, and from code as `MEDR-NNNN` in a comment so references are greppable.

## Status and implementation

`status` is about the decision, `implementation` about the code.

| Status       | Meaning                                               |
| ------------ | ----------------------------------------------------- |
| `accepted`   | Merged and authoritative.                             |
| `deprecated` | No longer recommended, nothing has replaced it.       |
| `superseded` | Replaced by a newer record; `superseded_by` names it. |

| Implementation | Meaning                                                                       |
| -------------- | ----------------------------------------------------------------------------- |
| `shipped`      | Built and on `main`. The whole decision, not the easy half.                   |
| `partial`      | Some of it runs. The note says which half is missing.                         |
| `in-flight`    | Implemented somewhere that is not `main`. The note names the branch or stash. |
| `none`         | Nothing implements it yet.                                                    |

## Amending vs superseding

- Typo, clarification, the code catching up: amend in place and add a dated Changelog line.
- The decision changes: write a new record with `supersedes: N`, mark the old one `superseded` with `superseded_by: M`, and never edit its decision text.

## Not a record

Bug fixes, implementation detail inside a decided design, and open questions. Open questions live in [the design notes](../internals/routing.md).

## Index

| Record                                                 | Summary                                                                                                                     |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| [MEDR-0001](./0001-embedded-segment-router.md)         | A component owns one segment and derives its route from it; everything outside the segment is an exit via clerk-js.         |
| [MEDR-0002](./0002-names-in-parts-out.md)              | Routes are named; the codec works on decoded parts and never sees a URL; the location encodes once each way.                |
| [MEDR-0003](./0003-page-state-acts-like-a-url.md)      | Routing state is a map above the components; an entry lives while its base has an owner; a modal is its entry.              |
| [MEDR-0004](./0004-owner-and-nested-routers.md)        | The owner names the root that lives at the base and redirects unknown segments there; nested routers never write.           |
| [MEDR-0005](./0005-profile-url-shape.md)               | Profiles use legacy's segments with the first page as root, and have no opening-page prop.                                  |
| [MEDR-0006](./0006-validate-host-paths-at-the-edge.md) | A custom page path must be exactly its segment, checked where it enters; the codec throws only on Mosaic's own bugs.        |
| [MEDR-0007](./0007-location-contract-suite.md)         | Every location mode passes one contract suite; differences are declared, not discovered.                                    |
| [MEDR-0008](./0008-url-carriers.md)                    | A URL mode derives its segment from the host URL and writes the URL back at once; one param per base in hash and query.     |
| [MEDR-0009](./0009-router-adapter.md)                  | The host router is reached through a plain adapter of optional hooks on `MosaicProvider`; missing ones fall back to window. |
