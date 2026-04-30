---
'@clerk/testing': patch
---

Increase timeouts in two `unstable_PageObjects` Playwright helpers so they hold up on slower CI runners:

- `userButton.waitForMounted` now waits up to 30s for the `.cl-userButtonTrigger` element to attach (previously inherited the global 10s `actionTimeout`).
- `sessionTask.resolveResetPasswordTask` now explicitly waits up to 30s for the new-password input to become visible before filling it.
