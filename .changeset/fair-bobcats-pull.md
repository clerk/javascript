---
'@clerk/backend': patch
'@clerk/types': patch
---

Add type-level validation to prevent server-side usage of system permissions

System permissions (e.g., `org:sys_domains:manage`) are intentionally excluded from session claims to maintain reasonable JWT sizes. For more information, refer to our docs: https://clerk.com/docs/organizations/roles-permissions#system-permissions
