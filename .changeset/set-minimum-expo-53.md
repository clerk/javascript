---
'@clerk/expo': major
'@clerk/expo-passkeys': major
'@clerk/shared': major
'@clerk/react': major
'@clerk/localizations': major
---

Drop support for Expo 50, 51 and 52. This release includes two breaking changes:

## 1. Updated Expo peer dependency requirements

**@clerk/clerk-expo**
- **Added** new peer dependency: `expo: >=53 <55`
  - The core `expo` package is now explicitly required as a peer dependency
  - This ensures compatibility with the Expo SDK version range that supports the features used by Clerk

**@clerk/expo-passkeys**
- **Updated** peer dependency: `expo: >=53 <55` (previously `>=50 <55`)
  - Minimum Expo version increased from 50 to 53
  - This aligns with the main `@clerk/clerk-expo` package requirements

## 2. Removed legacy subpath exports

The following packages have removed their legacy subpath export mappings:
- `@clerk/clerk-expo`
- `@clerk/shared`
- `@clerk/clerk-react`
- `@clerk/localizations`

**What changed:**
Previously, these packages used a workaround to support subpath imports (e.g., `@clerk/shared/react`, `@clerk/clerk-expo/web`). These legacy exports have been removed in favor of modern package.json `exports` field configuration.

All public APIs remain available through the main package entry points.



