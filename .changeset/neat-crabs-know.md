---
'@clerk/clerk-sdk-node': major
---

Changes the `request.auth` type from `LegacyAuthObject` to `AuthObject`.
```typescript
type LegacyAuthObject = {
  sessionId: string | null;
  actor: ActClaim | undefined | null;
  userId: string | null;
  getToken: ServerGetToken | null;
  debug: AuthObjectDebug | null;
  claims: JwtPayload | null;
}

type AuthObject = {
  sessionClaims: JwtPayload | null;
  sessionId: string | null;
  actor: ActClaim | undefined | null;
  userId: string | null;
  orgId: string | undefined | null;
  orgRole: OrganizationCustomRoleKey | undefined | null;
  orgSlug: string | undefined | null;
  orgPermissions: OrganizationCustomPermissionKey[] | undefined | null;
  getToken: ServerGetToken | null;
  has: CheckAuthorizationWithCustomPermissions | null;
  debug: AuthObjectDebug | null;
};
```
