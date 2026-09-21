---
'@clerk/shared': patch
---

Reword the missing and invalid key errors around the two Clerk CLI commands. The message now opens with "You're ready to set up your Clerk .env keys.", then offers `npx clerk@latest init` for a new application and `npx clerk@latest env pull` for an existing one, each on its own labelled line, followed by a short paragraph explaining what each command does and where to find keys in the Dashboard. The missing secret key error keeps its `Missing secretKey.` lead so it stays distinguishable from the missing publishable key error.
