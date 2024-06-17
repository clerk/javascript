---
title: '`navigate` prop to `ClerkProvider` replaced by `routerPush` and `routerReplace`'
matcher: "<ClerkProvider[\\s\\S]*?navigate=[\\s\\S]*?>"
category: 'routerpush-replace'
matcherFlags: 'm'
---

The `navigate` prop on ClerkProvider allowed developers to override the default navigation behavior with a custom function. However, navigate was only able to push, not replace routes. We have now added the capability for the router to push or replace, and as such, upgraded the provider prop so that it can handle either depending on the circumstance.

Two new props have been added to `ClerkProvider` that replace the single `navigate` prop, and can be used to override the default navigation behavior for either a push or replace navigation. For more information on what push and replace mean in relation to the browser history api, [check out these wonderful MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API).

If you’d like to keep the same behavior as you had with the single `navigate` prop, pass the exact same function to both `routerPush` and `routerReplace` and the behavior will be identical. For example:

```diff
- <ClerkProvider navigate={ x => x } />
+ <ClerkProvider routerPush={ x => x } routerReplace={ x => x } />
```

However, you now have the option to differentiate behavior based on whether the navigation will be a push or replace.
