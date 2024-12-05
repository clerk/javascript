---
'@clerk/backend': minor
---

New API (experimental):
Introducing `AccountlessApplicationAPI` accessible via `clerkClient.__experimental_accountlessApplications`.
It allows for an Accountless application to be generated and response with a publishable key, secret key and a URL that someone can use in order to claim the application in their account. 
