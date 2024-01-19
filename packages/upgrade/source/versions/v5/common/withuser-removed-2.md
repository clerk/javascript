---
title: '`WithUser` component removed'
matcher: "import\\s+{[\\s\\S]*?withUser[\\s\\S]*?from\\s+['\"]@clerk\\/(?:nextjs|clerk-react)[\\s\\S]*?['\"]"
matcherFlags: 'm'
---

<!-- why is this called withuser-removed-2 you may ask? if you remove the "-2", it doesn't load, depsite identical content. Truly, this is baffling -->

The `WithUser` higher order component has been removed. If you would still like to use this function in the way its implemented, it can be created quickly using Clerk's [custom hooks](https://clerk.com/docs/references/react/overview). An example of how to do so is below:

```js
export const WithUser = ({ children }) => {
  const user = useUser();
  if (typeof children !== 'function') throw new Error();

  return {children(user)};
};
```
