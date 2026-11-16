---
'@clerk/shared': minor
'@clerk/ui': patch
---

`useReverification()` accepts a `prefill` option. When a user resets a breached or compromised password to reverify, the modal saves the new password from `prefill` instead of asking for it again, so a password change form doesn't make the user type it twice. It's called with the request's arguments when reverification is needed, and custom `onNeedsReverification` handlers receive its values as `prefill`.

```tsx
const updatePassword = useReverification(
  (reverification, currentUser: UserResource, params: UpdateUserPasswordParams) =>
    // A password reset during reverification already saved the new password.
    reverification?.passwordReset ? currentUser.reload() : currentUser.updatePassword(params),
  {
    passReverificationResult: true,
    prefill: (_currentUser, params) => ({
      newPassword: params.newPassword,
      signOutOfOtherSessions: !!params.signOutOfOtherSessions,
    }),
  },
);
```
