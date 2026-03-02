---
"@clerk/react": patch
---

Fix `ReferenceError: Property 'document' doesn't exist` crash in React Native environments by conditionally loading UI scripts only in standard browser contexts.
