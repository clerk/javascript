---
title: '`withServerAuth` props.auth return type changed'
matcher: "withServerAuth\\("
---

When utilizing the `withServerAuth` helper in Gatsby, it expects a callback function that is called with props from Clerk internals. The `.auth` property on the returned object from the callback has seen a substantial change in its return type. Note specifically that the property `auth.claims` was changed to `auth.sessionClaims` in addition to the other typing changes. A full example of how this looks and how the types differ can be seen below:

```js
import { withServerAuth } from 'gatsby-plugin-clerk/ssr';

export const getServerData: GetServerData<any> = withServerAuth(async props => {
	return { props: { data: '1', auth: props.auth } };
});
// props.auth : v4 exported type
/*
{
  sessionId: string | null;
  userId: string | null;
  actor: ActJWTClaim | null;
  getToken: ServerGetToken;
  claims: ClerkJWTClaims | null;
};
*/

// props.auth : v5 exported type
/*
{
  sessionClaims: JwtPayload;
  sessionId: string | null;
  session: Session | undefined | null;
  actor: ActClaim | undefined | null;
  userId: string | null;
  user: User | undefined | null;
  orgId: string | undefined | null;
  orgRole: string | undefined | null;
  orgSlug: string | undefined | null;
  organization: Organization | undefined | null;
  getToken: ServerGetToken;
  experimental__has: experimental__CheckAuthorizationWithoutPermission;
  debug: AuthObjectDebug;
};
*/
```
