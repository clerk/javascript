---
'@clerk/chrome-extension': minor
'@clerk/clerk-js': minor
'@clerk/nextjs': minor
'@clerk/clerk-react': minor
'@clerk/types': minor
---


Add support for GoogleOneTap. New APIs listed:
### React component
- `<GoogleOneTap/>`

Customize the UX of the prompt

```tsx
<GoogleOneTap
  cancelOnTapOutside={false}
  itpSupport={false}
  fedCmSupport={false}
/>
```

### Use the component from with Vanilla JS
- `Clerk.openGoogleOneTap(props: GoogleOneTapProps)`
- `Clerk.closeGoogleOneTap()`
### Low level APIs for custom flows
- `await Clerk.authenticateWithGoogleOneTap({ token: 'xxxx'})`
- `await Clerk.handleGoogleOneTapCallback()`

We recommend using this two methods together in order and let Clerk perform the correct redirections.
```tsx
google.accounts.id.initialize({
  callback: async response => {
    const signInOrUp = await Clerk.authenticateWithGoogleOneTap({ token: response.credential})
    await Clerk.handleGoogleOneTapCallback(signInOrUp, {
      afterSignInUrl: window.location.href,
    })
  },
});
```

In case you want to handle the redirection and session management yourself you can do so like this
```tsx
google.accounts.id.initialize({
  callback: async response => {
    const signInOrUp = await Clerk.authenticateWithGoogleOneTap({ token: response.credential})
    if(signInOrUp.status === 'complete') {
        await Clerk.setActive({
          session: signInOrUp.createdSessionId
        })
    }
  },
});
```
