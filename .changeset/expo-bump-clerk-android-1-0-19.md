---
'@clerk/expo': patch
---

Bump the bundled `clerk-android` SDK (`clerk-android-api` and `clerk-android-ui`) from `1.0.16` to `1.0.19`. This pulls in the fix from clerk-android [#671](https://github.com/clerk/clerk-android/pull/671), which sets the correct IME actions on the prebuilt auth input fields so pressing Enter/Return submits the form (e.g. "Continue") instead of inserting a newline.
