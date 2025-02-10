---
title: '`LegacyAuthObject` type -> `AuthObject`'
matcher: '(?:LegacyAuthObject|LooseAuthProp|StrictAuthProp)'
---

We changed the values that our middleware adds to the `request` object after running. Previously it returned a `LegacyAuthObject` type, and now it returns an `AuthObject` type, the difference between the two types is as such:

```diff
- type LegacyAuthObject = {
+ type AuthObject = {
    sessionId: string | null;
    actor: ActClaim | undefined | null;
    userId: string | null;
    getToken: ServerGetToken | null;
    debug: AuthObjectDebug | null;
-   claims: JwtPayload | null;
+   sessionClaims: JwtPayload | null;
+   orgId: string | undefined | null;
+   orgRole: OrganizationCustomRoleKey | undefined | null;
+   orgSlug: string | undefined | null;
+   orgPermissions: OrganizationCustomPermissionKey[] | undefined | null;
+   has: CheckAuthorizationWithCustomPermissions | null;
  }
```

If you were using the `claims` key on the request after running middleware, you will need to instead use `sessionClaims`. Additionally, if you were using the `LooseAuthProp` or `StrictAuthProp` exported types anywhere, note that these have been adjusted to fit the shape of the new middleware response typing.
