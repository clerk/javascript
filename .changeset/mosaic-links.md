---
'@clerk/mosaic': minor
---

A `?.user=security` link now opens a Mosaic component on that page in every routing mode, not only in `query` mode: the param is named after the component's base, so `?.modal.user=account` opens the profile modal on its account page. A component in `virtual`, `path` or `hash` mode moves to the page the link names and removes the param from the URL, including when the link is followed while the page is already open; a component that already has a page in the URL when it loads keeps it.

Redirect flows in `UserProfile` (connecting an OAuth or enterprise account, and verifying an email address through an identity provider) return to the page and modal they started from through such a link, in every routing mode. The `__clerk_mosaic_modal` query param is no longer written or read.
