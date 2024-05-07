---
'@clerk/elements': patch
---

Add a `complete` step to Sign In and Sign Up flows for when a user is being set as active and has yet to be redirected to the desired URL.

```tsx
<SignIn.Step name="complete">
  Welcome back! You're being redirected...
</SignIn.Step>
```
```tsx
<SignUp.Step name="complete">
  Welcome! You're being redirected...
</SignUp.Step>`
```
