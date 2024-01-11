---
"@clerk/clerk-js": patch
"@clerk/clerk-react": patch
"@clerk/shared": minor
---

Allow dynamic values components props, even if these values change after the components are rendered. For example, a `SignIn` component with a `redirectUrl` prop passed in will always respect the latest value of `redirectUrl`.
