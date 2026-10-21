---
'@clerk/upgrade': patch
---

Correct the Core 3 note about `ClerkProvider` and Next.js Cache Components. It no longer says `ClerkProvider` may need a `<Suspense>` boundary. It now lists the code that does (`<Show>`, `auth()`, `currentUser()`, and catch-all `<SignIn />`, `<SignUp />`, `<UserProfile />`, and `<OrganizationProfile />`) and links to the Cache Components guide.
