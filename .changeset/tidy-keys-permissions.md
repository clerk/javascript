---
'@clerk/ui': patch
---

Fix the OrganizationProfile sidebar to hide API keys when the user has neither `org:sys_api_keys:read` nor `org:sys_api_keys:manage` permission.
