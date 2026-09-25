---
'@clerk/clerk-js': minor
'@clerk/ui': minor
'@clerk/shared': patch
---

Resolve Clerk Protect challenges in custom sign-in and sign-up flows. When a request returns a `protect_check`, clerk-js opens Clerk's Protect UI in a modal over the page, runs the challenge, submits the proof, and then lets the original call return. Nothing needs to be rendered by the application. The prebuilt `<SignIn />` and `<SignUp />` components keep handling challenges inside their own cards.
