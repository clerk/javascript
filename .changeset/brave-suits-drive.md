---
'@clerk/clerk-js': major
---

All the components that using routing will throw a runtime error if the a path property is provided with a routing strategy other than path.

Example that will throw an error:
```tsx
<SignIn routing='hash' path='/sign-in' />
```
