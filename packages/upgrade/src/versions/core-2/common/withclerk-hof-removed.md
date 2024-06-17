---
title: '`withClerk` function removed'
matcher: "import\\s+{[^}]*?withClerk[\\s\\S]*?from\\s+['\"]@clerk\\/(?:nextjs|clerk-react)[\\s\\S]*?['\"]"
category: 'hof-removal'
matcherFlags: 'm'
---

The `withClerk` higher order function has been removed. If you would still like to use this function in the way its implemented, it can be created quickly using Clerk's [custom hooks](https://clerk.com/docs/references/react/overview). An example of how to do so is below:

```js
function withClerk(Component, displayName) {
  displayName = displayName || Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;
  const HOC = props => {
    const clerk = useIsomorphicClerkContext();

    if (!clerk.loaded) return null;

    return (
      <Component
        {...props}
        clerk={clerk}
      />
    );
  };

  HOC.displayName = `withClerk(${displayName})`;
  return HOC;
}
```
