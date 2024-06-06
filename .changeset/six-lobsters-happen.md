---
'@clerk/elements': minor
---

The `path` prop on the `<SignIn.Root>` and `<SignUp.Root>` component is now automatically inferred. Previously, the default values were `/sign-in` and `/sign-up`, on other routes you had to explicitly define your route.

The new heuristic for determining the path where `<SignIn.Root>` and `<SignUp.Root>` are mounted is:

1. `path` prop
2. Automatically inferred
3. If it can't be inferred, fallback to `CLERK_SIGN_IN_URL` and `CLERK_SIGN_UP_URL` env var
4. Fallback to `/sign-in` and `/sign-up`
