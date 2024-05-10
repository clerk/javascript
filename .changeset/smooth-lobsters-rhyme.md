---
'@clerk/elements': patch
---

Correctly set allowed props types for `<SignIn.Step name="choose-strategy">` and `<SignIn.Step name="forgot-password">`. You should be able to pass all valid `<form>` props now. Previously only `children: React.ReactNode` was allowed.
