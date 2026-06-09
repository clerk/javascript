---
'@clerk/ui': patch
'@clerk/shared': patch
---

Internal refactor for self-serve SSO wizard navigation to leverage a guard-based state machine.

It makes the step navigation more predictable: the step you land on (including after a reload) and which steps you can move to are derived from the connection's state, the connection reset flow lands you on the right step.
