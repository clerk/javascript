---
"@clerk/shared": minor
"@clerk/ui": minor
"@clerk/react": minor
---

Add an experimental `externalAuth` option to `ClerkProvider` for non-browser runtimes to provide custom OAuth and SSO transport. When configured, Clerk's prebuilt sign-in and sign-up components use the provided transport instead of web redirects or popups.
