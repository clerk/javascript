---
'@clerk/react': patch
---

Fix `__internal_clerkJSUrl` and `__internal_clerkUIUrl` being silently ignored when bundled `Clerk` or `ui.ClerkUI` constructors are provided. Internal URL overrides now take precedence.
