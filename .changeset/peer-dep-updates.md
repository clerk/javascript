---
'@clerk/clerk-expo': major
'@clerk/expo-passkeys': major
---

**Breaking Change: Updated peer dependency requirements for Expo packages**

This changeset updates the peer dependency requirements for Expo-related packages:

**@clerk/clerk-expo**
- **Added** new peer dependency: `expo: >=53 <55`
  - The core `expo` package is now explicitly required as a peer dependency
  - This ensures compatibility with the Expo SDK version range that supports the features used by Clerk

**@clerk/expo-passkeys**
- **Updated** peer dependency: `expo: >=53 <55` (previously `>=50 <55`)
  - Minimum Expo version increased from 50 to 53
  - This aligns with the main `@clerk/clerk-expo` package requirements

These changes ensure that users are running compatible versions of the Expo SDK that support all Clerk features, particularly those related to authentication, secure storage, and passkey functionality.

**Migration Guide:**
If you're using these packages, ensure your `expo` dependency is updated to version 53 or later.

