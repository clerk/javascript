---
"@clerk/clerk-js": minor
"@clerk/types": minor
---

Expose `SessionVerification` as an experimental resource. 
Update `UserResource` with 5 new experimental methods:
- `experimental_verifySession` for creating a new SessionVerification record and initiating a new flow.
- `experimental_verifySessionPrepareFirstFactor` for preparing a supported first factor like `phone_code`
- `experimental_verifySessionAttemptFirstFactor` for attempting a supported first factor like `password`
- `experimental_verifySessionPrepareSecondFactor` for preparing a supported second factor like `phone_code`
- `experimental_verifySessionAttemptSecondFactor` for attempting a supported second factor like `totp`
