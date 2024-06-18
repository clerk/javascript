---
title: '`frontendApi` -> `publishableKey` as prop to `ClerkProvider`'
matcher: "<ClerkProvider[\\s\\S]*?frontendApi=[\\s\\S]*?>"
category: 'deprecation-removal'
matcherFlags: 'm'
---

The `frontendApi` prop passed to `ClerkProvider` must be changed to `publishableKey`. The value also must be updated to be a publishable key rather than a frontend API key. Publishable keys can be found in your Clerk dashboard.

```diff
import { ClerkProvider } from '@clerk/clerk-expo';

- <ClerkProvider frontendApi='...' />
+ <ClerkProvider publishableKey='...' />
```
