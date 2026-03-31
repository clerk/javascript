---
"@clerk/expo": patch
---

Add directory-level `package.json` fallback stubs for all subpath exports so that imports like `@clerk/expo/token-cache` resolve correctly in React Native bundlers that don't support the `exports` field (e.g., Metro without `unstable_enablePackageExports`).
