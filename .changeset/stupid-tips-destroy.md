---
'@clerk/clerk-expo': patch
---

The [issue #1680](https://github.com/clerkinc/javascript/issues/1608) has uncovered that the version `1.3.0` of `react-native-url-polyfill` did not had support for Expo Web.

The error was that because we rely on `react-native-url-polyfill/auto`, the would also apply the polyfill if executed on the web, which is not required as the `URL` has support for all modern browsers and there is no need to pollyfill it.

The version of `react-native-url-polyfill` was upgraded from `1.3.0` to `2.0.0` to fix the error.
