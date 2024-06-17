---
title: '`withServerAuth` props.auth return type changed'
matcher: "withServerAuth\\("
---

When utilizing the `withServerAuth` helper in Gatsby, it expects a callback function that is called with props from Clerk internals. The `.auth` property on the returned object from the callback has seen a substantial change in its return type. Below is a code example of where the `auth` prop might be found:

```js
import { withServerAuth } from 'gatsby-plugin-clerk/ssr';

export const getServerData: GetServerData<any> = withServerAuth(async props => {
  return { props: { data: '...', auth: props.auth } };
});
```

And here's a diff of the changes in the return type. The breaking change here specifically is that the property `auth.claims` was changed to `auth.sessionClaims`. Additionally, there is more information on the response that can be utilized if helpful.

```diff
 // return type diff
 {
   sessionId: string | null;
   userId: string | null;
   actor: ActJWTClaim | null;
   getToken: ServerGetToken;
-  claims: ClerkJWTClaims | null;
+  sessionClaims: JwtPayload;
+  session: Session | undefined | null;
+  user: User | undefined | null;
+  orgId: string | undefined | null;
+  orgRole: string | undefined | null;
+  orgSlug: string | undefined | null;
+  organization: Organization | undefined | null;
+  debug: AuthObjectDebug;
 };
```
