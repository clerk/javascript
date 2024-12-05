---
'@clerk/backend': minor
---

New **experimental** API: `AccountlessApplicationAPI`

Inside `clerkClient` you can activate this new API through `__experimental_accountlessApplications`. It allows you to generate an "accountless" application and the API returns the publishable key, secret key, and an URL as a response. The URL allows a user to claim this application with their account. Hence the name "accountless" because in its initial state the application is not attached to any account yet.
