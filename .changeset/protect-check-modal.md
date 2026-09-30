---
'@clerk/clerk-js': minor
'@clerk/ui': minor
'@clerk/shared': patch
'@clerk/react': patch
---

Custom flows built with `useSignIn()` and `useSignUp()` now handle Clerk Protect challenges for you. When a sign-in or sign-up method gets a challenge, Clerk shows it in a modal and the method returns once the user passes it. For SSO, the challenge appears when the user comes back to `<HandleSSOCallback />`. Classic resource methods such as `clerk.client.signIn.create()`, and apps without Clerk's UI loaded, still return with `protectCheck` set, as before.
