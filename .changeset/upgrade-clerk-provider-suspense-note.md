---
'@clerk/upgrade': patch
---

Correct the Core 3 `<Suspense>` guidance for Next.js Cache Components. A plain `ClerkProvider` doesn't need a `<Suspense>` boundary. The code under it that reads the request does: `<Show>`, `auth()`, `currentUser()`, and `<SignIn />`, `<SignUp />`, `<UserProfile />`, and `<OrganizationProfile />` on catch-all routes. With the `dynamic` prop, `ClerkProvider` needs a boundary too.
