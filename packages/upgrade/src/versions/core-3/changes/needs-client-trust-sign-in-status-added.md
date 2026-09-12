---
title: 'Sign-in Device Trust status handling'
category: 'breaking'
---

We've added a new Sign-in status of `needs_client_trust` which, given the conditions listed, will need to be handled in your application.

[Clerk Documentation: Device Trust](https://clerk.com/docs/guides/secure/device-trust)

Prerequisites:

- [Passwords and Device Trust](https://dashboard.clerk.com/~/user-authentication/user-and-authentication?user_auth_tab=password) are enabled.
- You've opted-in to the Device Trust `needs_client_trust` [Update](https://dashboard.clerk.com/~/updates).
- Sign-in with [Email](https://dashboard.clerk.com/~/user-authentication/user-and-authentication) and/or [Phone](https://dashboard.clerk.com/~/user-authentication/user-and-authentication?user_auth_tab=phone) identifiers are enabled.
- If [Email](https://dashboard.clerk.com/~/user-authentication/user-and-authentication) or [SMS](https://dashboard.clerk.com/~/user-authentication/user-and-authentication?user_auth_tab=phone) sign-in verification aren't enabled.

While your application may differ, we've provided an example change below. Please reach out to [Support](mailto:support@clerk.com) if you have any questions.

```diff
const { signIn } = useSignIn()
// ...
- if (signIn.status === 'complete') { /* ... */ }
+ if (signIn.status === 'needs_client_trust') { /* ... */ }
+ else if (signIn.status === 'complete') {  /* ... */ }
```
