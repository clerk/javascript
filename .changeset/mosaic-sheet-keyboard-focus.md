---
'@clerk/mosaic': patch
---

Fix dialogs shown as a bottom sheet on iOS jumping when moving between fields with the on-screen keyboard open. The focused field now scrolls into view above the keyboard inside the sheet instead of panning the page.
