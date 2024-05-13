---
'@clerk/clerk-js': minor
'@clerk/types': minor
---

Updates related to experimental Google One Tap support
- By default we are returning back to the location where the flow started.
  To accomplish that internally we will use the redirect_url query parameter to build the url.
```tsx
<__experimental_GoogleOneTap />
```

- In the above example if there is a SIGN_UP_FORCE_REDIRECT_URL or SIGN_IN_FORCE_REDIRECT_URL set then the developer would need to pass new values as props like this
```tsx
<__experimental_GoogleOneTap
  signInForceRedirectUrl=""
  signUpForceRedirectUrl=""
/>
```

- Let the developer configure the experience they want to offer. (All these values are true by default)
```tsx
<__experimental_GoogleOneTap
  cancelOnTapOutside={false}
  itpSupport={false}
  fedCmSupport={false}
/>
```

- Moved authenticateWithGoogleOneTap to Clerk singleton
```ts
Clerk.__experimental_authenticateWithGoogleOneTap
```

- Created the handleGoogleOneTapCallback in Clerk singleton
```ts
Clerk.__experimental_handleGoogleOneTapCallback
```
