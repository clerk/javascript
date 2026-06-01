---
'@clerk/ui': patch
---

Refactor `<ConfigureSSO />` to drive its wizard navigation through an internal state machine. Step routing now lives in a single pure reducer instead of inside individual steps, data is fetched once through a single hook, and all connection mutations are centralized and wrapped with reverification. No changes to the public API.
