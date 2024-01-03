---
title: '`Clerk.redirectToHome()` removed'
matcher: "Clerk.redirectToHome\\("
---

The `Clerk.redirectToHome` method has been removed. If you are looking for a generic replacement for this method, you can instead use `window.Clerk.redirectToAfterSignUp()` or `window.Clerk.redirectAfterSignIn()`.

To set the `afterSignUpUrl` or `afterSignInUrl`, you can:

    - [pass the desired values into ClerkProvider](https://clerk.com/docs/components/clerk-provider#properties)
    - if using nextjs SDK, set with `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` or `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
    - if using remix SDK, set with `CLERK_AFTER_SIGN_IN_URL` or `CLERK_AFTER_SIGN_UP_URL`
    - If not using a react-based SDK, they can be passed into `Clerk.load` as such: `Clerk.load({ afterSignUpUrl: ‘x’, afterSignInUrl: ‘y’ })`
