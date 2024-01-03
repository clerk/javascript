---
title: '`frontendApi` -> `publishableKey` as prop to `ClerkProvider`'
matcher: '<ClerkProvider.*?frontendApi=.*?>'
matcherFlags: 'm'
---

The `frontendApi` prop passed to `ClerkProvider` must be changed to `publishableKey`. The value also must be updated to be a publishable key rather than a frontend API key, [here’s more information on how to do this](TODO)

```js
import { ClerkProvider } from '@clerk/clerk-expo';

// before
<ClerkProvider frontendApi='...' />

// after
<ClerkProvider publishableKey='...' />
```
