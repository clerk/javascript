---
"@clerk/clerk-js": patch
---

fix(clerk-js): Handle missing window.location in React Native navigation

Fixed crash in React Native when `window.location` is undefined during navigation (e.g., when Client Trust triggers `needs_second_factor`). In React Native, `window` exists but `window.location` does not, causing navigation to fail when Clerk attempts redirect-based flows.
