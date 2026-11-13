---
'@clerk/mosaic': patch
---

Compound components such as `Avatar`, `Banner`, `DataList`, `EmptyState`, `Entity`, `Item` and `Table` can now be rendered from React Server Components, e.g. `<Avatar.Root>` in a Next.js App Router page. Each compound export is now a module namespace object instead of a plain object, so `X.Part` usage is unchanged, but its parts are read-only: assigning to `X.Part` no longer replaces it.
