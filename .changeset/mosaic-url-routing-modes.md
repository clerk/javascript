---
'@clerk/mosaic': minor
---

Adds 'path', 'query' and 'hash' routing modes.

`UserProfile`, `OrganizationProfile` and `Profile` take a `routing` prop that keeps the open page in the pathname under `path`, in a query param, or in the hash, so the page survives a reload and Back returns to the previous one. `virtual`, in memory, stays the default.

`MosaicProvider` takes a `routing` prop. `adapter` connects the URL modes to the host router (`usePathname` and `useSearchParams` from `next/navigation` is the Next.js one), `modals: 'query' | 'hash'` puts the profile modals in the URL too, and `keyPrefix` sets what the param names start with.

Modals now close when the host navigates to another pathname.
