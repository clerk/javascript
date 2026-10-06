---
'@clerk/expo': patch
---

Fix the close button of a dismissible `<AuthView />` doing nothing on iOS when the view is rendered inline instead of inside a modal. Tapping it now calls `onDismiss`.
