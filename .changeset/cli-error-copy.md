---
'@clerk/shared': patch
---

Update missing and invalid key error messages to recommend the Clerk CLI: `npx clerk@latest init` (non-interactive, no Clerk account required) to create an application, `npx clerk@latest env pull` to fetch the keys of an existing one, and `npx clerk@latest deploy` / `npx clerk@latest env pull --instance prod` for production. This covers both the `errorThrower` messages and the errors thrown by `parsePublishableKey(key, { fatal: true })`, which previously surfaced server-side as a bare `Publishable key not valid.` The Dashboard link is kept for manual key copying.
