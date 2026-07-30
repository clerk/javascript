import type { CustomPermissionKey } from '@clerk/shared/types';

import type { GetAuthFn } from '../../packages/backend/src/tokens/types';

declare global {
  interface ClerkAuthorization {
    permission: 'things:read' | 'things:write';
    role: 'org:admin';
  }
}

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2 ? true : false;
type Expect<Value extends true> = Value;

const getAuth = null as unknown as GetAuthFn<Request>;
const auth = getAuth(new Request('https://example.com'), { acceptsToken: 'oauth_token' });

auth.has({ scope: 'read:things' });
auth.has({ permission: 'things:read' });
// @ts-expect-error - OAuth tokens do not carry Organization roles
auth.has({ role: 'org:admin' });
// @ts-expect-error - OAuth tokens do not carry Billing features
auth.has({ feature: 'user:things' });
// @ts-expect-error - OAuth tokens do not carry Billing plans
auth.has({ plan: 'user:pro' });
// @ts-expect-error - OAuth checks require one authorization dimension
auth.has({});

// @ts-expect-error - Permission keys honor ClerkAuthorization augmentation
auth.has({ permission: 'things:delete' });
// @ts-expect-error - OAuth checks accept exactly one authorization dimension
auth.has({ scope: 'read:things', permission: 'things:read' });
// @ts-expect-error - OAuth scope checks do not accept legacy authorization dimensions
auth.has({ scope: 'read:things', role: 'org:admin' });

type _CustomPermissionKeyIsAugmented = Expect<Equal<CustomPermissionKey, 'things:read' | 'things:write'>>;
type _OAuthPermissionsAreAugmented = Expect<Equal<typeof auth.permissions, CustomPermissionKey[] | null>>;
