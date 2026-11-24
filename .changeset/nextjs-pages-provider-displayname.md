---
'@clerk/nextjs': patch
---

Fix Partial Prerendering resumes failing with "Expected the resume to render <ClerkProvider> in this slot but instead it rendered <ReactClerkProvider>". Loading the Pages Router `ClerkProvider` module no longer renames the provider component it shares with the App Router.
