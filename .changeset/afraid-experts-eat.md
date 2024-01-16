---
'@clerk/backend': major
---

Drop `user` / `organization` / `session` from auth object on **signed-out** state (current value was `null`). Eg

```diff
    // Backend
    import { createClerkClient } from '@clerk/backend';

    const clerkClient = createClerkClient({...});
    const requestState = clerkClient.authenticateRequest(request, {...});

    - const { user, organization, session } = requestState.toAuth();
    + const { userId, organizationId, sessionId } = requestState.toAuth();

    // Remix
    import { getAuth } from '@clerk/remix/ssr.server';
    
    - const { user, organization, session } = await getAuth(args);
    + const { userId, organizationId, sessionId } = await getAuth(args);

    // or 
    rootAuthLoader(
        args,
        ({ request }) => {
            - const { user, organization, session } = request.auth;
            + const { userId, organizationId, sessionId } = request.auth;
            // ...
        },
        { loadUser: true },
    );

    // NextJS
    import { getAuth } from '@clerk/nextjs/server';
    
    - const { user, organization, session } = getAuth(args);
    + const { userId, organizationId, sessionId } = getAuth(req, opts);

    // Gatsby
    import { withServerAuth } from 'gatsby-plugin-clerk';

    export const getServerData: GetServerData<any> = withServerAuth(
        async props => {
            - const { user, organization, session } =  props;
            + const { userId, organizationId, sessionId } = props;
            return { props: { data: '1', auth: props.auth, userId, organizationId, sessionId } };
        },
        { loadUser: true },
    );
```
