---
'@clerk/clerk-js': minor
'@clerk/types': minor
---

Updates related to experimental Google One Tap support
- Comply with Clerk's redirection logic ( & priorities )
```tsx
<__experimental_GoogleOneTap
  signInForceRedirectUrl=""
  signUpForceRedirectUrl=""
  signInFallbackRedirectUrl=""
  signUpFallbackRedirectUrl=""
/>
```

- Opt-in for user to return back where they started ( this overrides the above)
```tsx
<__experimental_GoogleOneTap  returnToCurrentLocation />
```

- Moved handleGoogleOneTapCallback to Clerk singleton
```ts
Clerk.__experimental_handleGoogleOneTapCallback
```
