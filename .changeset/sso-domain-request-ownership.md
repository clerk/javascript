---
'@clerk/ui': patch
---

Reset the standalone SSO wizard when the account or organization changes. Prevent duplicate SSO domain selection and verification requests. Discard late errors after the domain step closes or changes connection, and stop domain removal if ownership changes during the selection update.
