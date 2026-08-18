import type { AuthenticateRequestOptions, GetAuthFnNoRequest } from '@clerk/backend/internal';
import type { PendingSessionOptions } from '@clerk/shared/types';

export type AuthOptions = PendingSessionOptions & Pick<AuthenticateRequestOptions, 'acceptsToken'>;

/**
 * @internal This type is used to define the `auth` function in the event context.
 */
export type AuthFn = GetAuthFnNoRequest;
