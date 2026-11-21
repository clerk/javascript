---
'@clerk/ui': patch
---

Modals now have an accessible name. The dialog is labelled by its visible title (via `aria-labelledby`), so screen readers announce e.g. the reverification prompt by its heading instead of just "dialog".
