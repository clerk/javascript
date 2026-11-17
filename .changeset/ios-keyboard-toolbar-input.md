---
'@clerk/ui': patch
---

Fix text inputs on iOS staying hidden behind the keyboard's floating toolbar when focused. When the keyboard opens over a focused field, the field now scrolls into view. This mainly affected sign-in inside an in-app browser sheet on smaller iPhones.
