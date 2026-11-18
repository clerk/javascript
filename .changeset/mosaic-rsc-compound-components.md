---
'@clerk/mosaic': patch
---

Compound components imported from `@clerk/mosaic/components/*` (`Avatar`, `Banner`, `Card`, `DataList`, `EmptyState`, `Entity`, `Field`, `Item`, `Panel`, `Popover`, `Profile`, `Radio`, `Section`, `SegmentedControl`, `Switcher` and `Table`) can now be rendered from React Server Components, e.g. `<Avatar.Root>` in a Next.js App Router page. Each compound export is now a module namespace object instead of a plain object, so `X.Part` usage is unchanged, but its parts are read-only: assigning to `X.Part` no longer replaces it.
