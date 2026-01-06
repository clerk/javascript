---
title: '`UserButton` sign-out redirect props removed'
matcher: '<UserButton[\\s\\S]*?(afterSignOutUrl|signOutUrl)[\\s\\S]*?>'
matcherFlags: 'm'
category: 'deprecation-removal'
---

The `UserButton` component no longer accepts sign-out redirect override props. Configure sign-out redirects using one of these methods:

**Global configuration:**

```jsx
<ClerkProvider afterSignOutUrl="/signed-out">
```

**Per-button with SignOutButton:**

```jsx
<SignOutButton redirectUrl='/goodbye'>Sign Out</SignOutButton>
```

**Programmatic:**

```js
clerk.signOut({ redirectUrl: '/signed-out' });
```
