---
'@clerk/clerk-js': patch
---

The [issue #1557](https://github.com/clerkinc/javascript/issues/1557) uncovered that when using `@clerk/nextjs` together with `next-intl` the error `"Failed to execute 'removeChild' on 'Node'"` was thrown.

That error came from `@floating-ui/react` which `@clerk/clerk-js` used under the hood. Its version was upgraded from `0.19.0` to `0.25.4` to fix this error.

This error is probably not isolated to `next-intl` so if you encountered a similar error in the past, try upgrading.
