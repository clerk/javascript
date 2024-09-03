---
"@clerk/clerk-js": minor
"@clerk/types": minor
---

Move SessionVerification methods from UserResource to SessionResource:

- `user.__experimental_verifySession` -> `session.__experimental_startVerification`
- `user.__experimental_verifySessionPrepareFirstFactor` -> `session.__experimental_prepareFirstFactorVerification`
- `user.__experimental_verifySessionAttemptFirstFactor` -> `session.__experimental_attemptFirstFactorVerification`
- `user.__experimental_verifySessionPrepareSecondFactor` -> `session.__experimental_prepareSecondFactorVerification`
- `user.__experimental_verifySessionAttemptSecondFactor` -> `session.__experimental_attemptSecondFactorVerification`
