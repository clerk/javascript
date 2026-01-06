---
'@clerk/chrome-extension': patch
'@clerk/expo': patch
'@clerk/expo-passkeys': patch
'@clerk/nextjs': patch
'@clerk/react': patch
'@clerk/react-router': patch
'@clerk/shared': patch
'@clerk/tanstack-react-start': patch
'@clerk/ui': patch
---

Fix React peer dependency version ranges to use `~` instead of `^` for React 19 versions, ensuring non-overlapping version constraints.
