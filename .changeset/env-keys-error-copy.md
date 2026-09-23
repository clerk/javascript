---
'@clerk/shared': patch
---

Missing and invalid key errors now list the Clerk CLI commands that fix them: `npx clerk@latest init` for a new app, `npx clerk@latest link` and `npx clerk@latest env pull` for an existing one, and `npx clerk@latest env pull --instance prod` for production keys. The missing secret key error skips `init`, since the publishable key already points to an existing app.
