---
'@clerk/ui': patch
---

Show an error and re-enable the buttons in `<UserProfile />` Connected Accounts when the OAuth transport fails, for example when an Electron app cannot open the system browser. The connect buttons previously stayed disabled until the component remounted.
