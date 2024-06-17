---
title: '`WithClerk` component removed'
matcher: "import\\s+{[^}]*?WithClerk[\\s\\S]*?from\\s+['\"]@clerk\\/(?:nextjs|clerk-react)[\\s\\S]*?['\"]"
category: 'hof-removal'
matcherFlags: 'm'
---

The `WithClerk` higher order component has been removed. If you would still like to use this function in the way its implemented, it can be created quickly using Clerk's [custom hooks](https://clerk.com/docs/references/react/overview). An example of how to do so is below:

```js
export const WithClerk = ({ children }) => {
  const clerk = useClerk();
  if (typeof children !== 'function') throw new Error();

  return {children(clerk)};
};
```
