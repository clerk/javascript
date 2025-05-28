---
'@clerk/shared': patch
---

Bug fix: In `createCheckAuthorization` allow for old `org_role` format in JWT v1 where `org:` is missing.

Example session claims:
```json
{
  "org_id": "org_xxxx",
  "org_permissions": [],
  "org_role": "admin",
  "org_slug": "test"
}
```
Code
```ts
authObject.has({ role: 'org:admin' }) // -> true
authObject.has({ role: 'admin' }) // -> true
```
