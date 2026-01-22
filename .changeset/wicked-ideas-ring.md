---
"@clerk/clerk-js": patch
"@clerk/expo": patch
---

fix(clerk-js): Handle missing window.location in React Native navigation

fix(expo): Make publishableKey prop required and remove env var fallbacks

- Fixed crash in React Native when `window.location` is undefined during navigation (e.g., when Client Trust triggers `needs_second_factor`)
- Made `publishableKey` a required prop in `ClerkProvider` since environment variables inside node_modules are not inlined during production builds
