---
'@clerk/clerk-js': patch
'@clerk/types': patch
---

Add `oidcPrompt` prop to `SignIn` and `SignUp` components and `authenticateWithRedirect` method to control the OIDC authentication prompt behavior during Enterprise SSO flows

```tsx
<SignUp oidcPrompt='select_account' />
<SignIn oidcPrompt='select_account' />
```

```ts
signUp.authenticateWithRedirect({ redirectUrl: '/sso-callback', oidcPrompt: 'select_account' })
```
