---
"@clerk/shared": patch
---

Fix prototype pollution vulnerability in `fastDeepMergeAndReplace` and `fastDeepMergeAndKeep` utilities by blocking dangerous keys (`__proto__`, `constructor`, `prototype`) during object merging.
