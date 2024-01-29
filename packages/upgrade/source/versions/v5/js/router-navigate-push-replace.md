---
title: '`navigate` argument to `Clerk.load` replaced by `routerPush` and `routerReplace`'
matcher: "Clerk\\.load\\([\\s\\S]*?navigate:[\\s\\S]*?\\)"
matcherFlags: 'm'
---

The `navigate` option allowed developers to override the default navigation behavior with a custom function. However, navigate was only able to push, not replace routes. We have now added the capability for the router to push or replace, and as such, updated `Clerk.load` so that it can handle either depending on the circumstance.

Two new arguments have been added to options that can be passed to `Clerk.load` that replace the single `navigate` argument, and can be used to override the default navigation behavior for either a push or replace navigation. For more information on what push and replace mean in relation to the browser history api, [check out these wonderful MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API).

If you’d like to keep the same behavior as you had with the single `navigate` argument, pass the exact same function to as both the `routerPush` and `routerReplace` arguments and the behavior will be identical. For example:

```diff
- Clerk.load({ navigate: x => x })
+ Clerk.load({ routerPush: x => x, routerReplace: x => x })
```

However, you now have the option to differentiate behavior based on whether the navigation will be a push or replace.
