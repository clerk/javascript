---
title: '`ClerkErrorBoundary` removed'
matcher: "import\\s+{[^}]*?ClerkErrorBoundary[\\s\\S]*?from\\s+['\"]@clerk\\/remix[\\s\\S]*?['\"]"
category: 'error-boundary-removed'
matcherFlags: 'm'
---

`ClerkErrorBoundary` is no longer needed for correct error handling in remix, so we have removed this function from the remix SDK, and it can be removed from your code as well. Example below:

```diff
 import { rootAuthLoader } from '@clerk/remix/ssr.server';
 import {
     ClerkApp,
-    ClerkErrorBoundary
 } from '@clerk/remix';

 export const loader = (args: DataFunctionArgs) => {
   return rootAuthLoader(args);
 };

 export default ClerkApp(App);

- export const ErrorBoundary = ClerkErrorBoundary();
```
