---
'@clerk/clerk-js': patch
'@clerk/clerk-react': patch
'@clerk/types': patch
---

Introduce new method `prefetchDependencies` to load Coinbase SDK instead of loading the SDK when click the `Coinbase` button in `<SignIn/>` / `<SignUp />`. This change avoid the Safari to block the Coinbase popup
