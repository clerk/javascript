---
'@clerk/nextjs': major
---

Drop support for NextJS v12: v12 was released on 26 Oct 2021. Support for security updates stopped on 21 Nov 2022.

Drop support for NextJS <13.0.4: Various header-related bugs were introduced with the 12.1.0, 12.2.0, 13.0.1, 13.0.2, 13.0.3 NextJS releases which are now fixed since next@^13.0.4. We will be dropping support for these problematic versions in order to greatly reduce complexity in our codebase.

Drop support for NextJS < 14.0.3 because of the issues described here: https://github.com/clerk/javascript/issues/1436.

Deprecate `authMiddleware` in favor of `clerkMiddleware`. For more information, see https://clerk.com/docs/upgrade-guides/v5-introduction

Move the server-side APIs from `@clerk/nextjs` to the `@clerk/nextjs/server` module: `WebhookEventType`, `WebhookEvent`, `verifyToken`, `redirectToSignIn`, `auth`, `buildClerkProps`, `clerkClient`, `currentUser`, `getAuth`, `redirectToSignUp` and `authMiddleware`. For more information, see https://clerk.com/docs/upgrade-guides/v5-introduction
