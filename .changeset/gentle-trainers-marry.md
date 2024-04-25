---
'@clerk/backend': minor
---

Updated types for `orderBy` in OrganizationApi and UserApi
- `OrganizationAPI.getOrganizationMembershipList` now accepts `orderBy` 
  - Acceptable values `phone_number`, `+phone_number`, `-phone_number`, `email_address`, `+email_address`, `-email_address`, `created_at`, `+created_at`, `-created_at`, `first_name`, `+first_name`, `-first_name` 
- `UserAPI.getUserList` expands the acceptable values of the `orderBy` to:
  - `email_address`, `+email_address`, `-email_address`, `web3wallet`, `+web3wallet`, `-web3wallet`, `first_name`, `+first_name`, `-first_name`, `last_name`, `+last_name`, `-last_name`, `phone_number`, `+phone_number`, `-phone_number`, `username`, `+username`, `-username`
