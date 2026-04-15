---
'@clerk/expo': patch
---

- Export `NativeSessionSync` and `app.plugin.js` sub-plugins to enable unit testing (internal, no public API change).
- Add JUnit/Robolectric/MockK test dependencies to the Android module for native unit tests.
