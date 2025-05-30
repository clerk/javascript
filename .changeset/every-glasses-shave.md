---
'@clerk/react-router': major
---

**Important:** This release only changes the required `react-router` version from `7.1.2` to `7.6.1`. No other changes were applied in this release.

You can upgrade like so:

```shell
npm install react-router@latest @clerk/react-router@latest
```

The reason for this change is that `@clerk/react-router` internally uses exports from `react-router` that were changed in [7.6.1](https://github.com/remix-run/react-router/blob/main/CHANGELOG.md#v761). These changes are breaking and `@clerk/react-router` can't add backward-compatible support for older and newer versions.
