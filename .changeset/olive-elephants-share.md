---
'@clerk/agent-toolkit': patch
'@clerk/react-router': patch
'@clerk/astro': patch
'@clerk/nuxt': patch
'@clerk/vue': patch
---

The [`exports` map](https://nodejs.org/api/packages.html#conditional-exports) inside `package.json` has been slightly adjusted to allow for [`require(esm)`](https://joyeecheung.github.io/blog/2024/03/18/require-esm-in-node-js/) to work correctly. The `"import"` conditions have been changed to `"default"`.

You shouldn't see any change in behavior/functionality on your end.
