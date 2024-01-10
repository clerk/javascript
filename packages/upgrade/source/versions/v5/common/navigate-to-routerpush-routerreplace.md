---
title: '`navigate` prop replaced by `routerPush` and `routerReplace`'
matcher: '<ClerkProvider.*?navigate=.*?>'
matcherFlags: 'm'
---

The `navigate` prop on `<ClerkProvider>` allowed developers to override the default navigation behavior with a custom function. However, `navigate` was only able to push, not replace routes. The router is now able to do both, and as such, the props for `<ClerkProvider>` were updated. The `routerPush` and `routerReplace` props replace the old `navigate` prop.

For more information on what push and replace mean in relation to the browser history api, check out the ["Working with the History API"](https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API) docs.

If you’d like to keep the same behavior as you had with the single `navigate` prop, pass the exact same function to both `routerPush` and `routerReplace`. For example:

```diff
- <ClerkProvider navigate={x => x} />
+ <ClerkProvider routerPush={x => x} routerReplace={x => x} />
```
