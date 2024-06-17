---
title: '`ClerkProviderOptionsWrapper` type removed'
category: 'deprecation-removal'
matcher: 'ClerkProviderOptionsWrapper'
---

This type was extending `ClerkProviderProps` with but was not necessary. This type is typically used internally and is not required to be imported and used directly. If needed, import and use `ClerkProviderProps` instead.
