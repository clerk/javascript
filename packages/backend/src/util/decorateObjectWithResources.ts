import type { CreateBackendApiOptions, Organization, Session, User } from '../api';
import { createBackendApiClient } from '../api';
import type { AuthObject, SignedInAuthObject, SignedOutAuthObject } from '../tokens/authObjects';

type DecorateAuthWithResourcesOptions = {
  loadSession?: boolean;
  loadUser?: boolean;
  loadOrganization?: boolean;
};

type WithResources<T> = T & {
  session?: Session | null;
  user?: User | null;
  organization?: Organization | null;
};

/**
 * @internal
 */
export const decorateObjectWithResources = async <T extends object>(
  obj: T,
  authObj: AuthObject,
  opts: CreateBackendApiOptions & DecorateAuthWithResourcesOptions,
): Promise<WithResources<T>> => {
  const { loadSession, loadUser, loadOrganization } = opts || {};
  const { userId, sessionId, orgId } = authObj as SignedInAuthObject | SignedOutAuthObject;

  const { sessions, users, organizations } = createBackendApiClient({ ...opts });

  const [sessionResp, userResp, organizationResp] = await Promise.all([
    loadSession && sessionId ? sessions.getSession(sessionId) : Promise.resolve(undefined),
    loadUser && userId ? users.getUser(userId) : Promise.resolve(undefined),
    loadOrganization && orgId ? organizations.getOrganization({ organizationId: orgId }) : Promise.resolve(undefined),
  ]);

  const resources = stripPrivateDataFromObject({
    session: sessionResp,
    user: userResp,
    organization: organizationResp,
  });
  return Object.assign(obj, resources);
};

/**
 * @internal
 */
export function stripPrivateDataFromObject<T extends WithResources<object>>(authObject: T): T {
  const user = authObject.user ? { ...authObject.user } : authObject.user;
  const organization = authObject.organization ? { ...authObject.organization } : authObject.organization;
  prunePrivateMetadata(user);
  prunePrivateMetadata(organization);
  return { ...authObject, user, organization };
}

function prunePrivateMetadata(resource?: { private_metadata: any } | { privateMetadata: any } | null) {
  // Delete sensitive private metadata from resource before rendering in SSR
  if (resource) {
    if ('privateMetadata' in resource) {
      delete resource['privateMetadata'];
    }
    if ('private_metadata' in resource) {
      delete resource['private_metadata'];
    }
  }

  return resource;
}
