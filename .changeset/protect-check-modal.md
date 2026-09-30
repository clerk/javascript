---
'@clerk/clerk-js': minor
'@clerk/ui': minor
'@clerk/shared': patch
'@clerk/react': patch
---

Resolve Clerk Protect challenges in custom flows built with the `useSignIn()` and `useSignUp()` hooks. When a sign-in or sign-up method returns a Protect challenge, Clerk opens a modal over the page, runs the challenge, and returns from the method once it clears. Your flow doesn't need to render anything or call `submitProtectCheck()`. `<HandleSSOCallback />` also resolves a challenge that arrives with an SSO redirect before it continues the flow. If Clerk's UI isn't loaded, these methods return with `protectCheck` set, as before.

The prebuilt `<SignIn />` and `<SignUp />` components are unchanged and still run challenges inside their own cards. Classic resource methods such as `clerk.client.signIn.create()` are also unchanged. They return with `protectCheck` set, and the caller runs the challenge.
