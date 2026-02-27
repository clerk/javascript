---
'@clerk/expo': major
'@clerk/expo-passkeys': major
---

Drop support for Expo 50, 51 and 52 with updated peer dependency requirements:

**@clerk/expo**
- **Added** new peer dependency: `expo: >=53 <55`
  - The core `expo` package is now explicitly required as a peer dependency
  - This ensures compatibility with the Expo SDK version range that supports the features used by Clerk

**@clerk/expo-passkeys**
- **Updated** peer dependency: `expo: >=53 <55` (previously `>=50 <55`)
  - Minimum Expo version increased from 50 to 53
  - This aligns with the main `@clerk/expo` package requirements
