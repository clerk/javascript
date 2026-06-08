---
'@clerk/ui': patch
'@clerk/shared': patch
---

`<ConfigureSSO />` wizard navigation is now driven by a guard-based state machine: the step you land on (including after a reload) and which steps you can move to are derived from the connection's state, the connection reset flow lands you on the right step, and enterprise-connection writes stay reverification-wrapped. The public component API is unchanged.
