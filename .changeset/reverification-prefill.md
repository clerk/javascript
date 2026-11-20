---
'@clerk/shared': minor
'@clerk/ui': patch
---

`useReverification()` accepts a `prefill` option. When a user resets a breached or compromised password to reverify, the modal saves the new password from `prefill.passwordReset` instead of asking for it again, so a password change form doesn't make the user type it twice. It's called with the request's arguments when reverification is needed, and custom `onNeedsReverification` handlers receive its values as `prefill`.

With `passReverificationResult: true`, the fetcher's `reverification` argument is now inferred, and the option is a type error on a fetcher that doesn't take the result first. The option's type moved from `UseReverificationOptions` to `UseReverificationWithResultOptions`, so code that passes `UseReverificationOptions` through to the hook keeps compiling. An options value annotated as `UseReverificationOptions` that sets `passReverificationResult: true` no longer compiles; pass the options to `useReverification()` inline instead. Runtime behavior is unchanged.

```tsx
const updatePassword = useReverification(
  (reverification, currentUser: UserResource, params: UpdateUserPasswordParams) =>
    // A password reset during reverification already saved the new password.
    reverification?.passwordReset ? currentUser.reload() : currentUser.updatePassword(params),
  {
    passReverificationResult: true,
    prefill: (_currentUser, params) => ({
      passwordReset: {
        newPassword: params.newPassword,
        signOutOfOtherSessions: !!params.signOutOfOtherSessions,
      },
    }),
  },
);
```
