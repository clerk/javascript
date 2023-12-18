---
'@clerk/clerk-js': minor
'@clerk/clerk-react': minor
'@clerk/types': minor
---

Remove MemberRole Type`MemberRole` would always include the old role keys `admin`, `member`, `guest_member`. 
If developers still depend on them after the introduction of custom roles, the can provide them as their custom types for authorization.
