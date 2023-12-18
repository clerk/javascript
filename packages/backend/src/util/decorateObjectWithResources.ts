import type { CreateBackendApiOptions, Organization, Session, User } from '../api';
import { createBackendApiClient } from '../api';
import type { AuthObject } from '../tokens/authObjects';

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
  const { userId, sessionId, orgId } = authObj;

  const { sessions, users, organizations } = createBackendApiClient({ ...opts });

  const [sessionResp, userResp, organizationResp] = await Promise.all([
    loadSession && sessionId ? sessions.getSession(sessionId) : Promise.resolve(undefined),
    loadUser && userId ? users.getUser(userId) : Promise.resolve(undefined),
    loadOrganization && orgId ? organizations.getOrganization({ organizationId: orgId }) : Promise.resolve(undefined),
  ]);

  const session = sessionResp && !sessionResp.errors ? sessionResp.data : undefined;
  const user = userResp && !userResp.errors ? userResp.data : undefined;
  const organization = organizationResp && !organizationResp.errors ? organizationResp.data : undefined;
  return Object.assign(obj, stripPrivateDataFromObject({ session, user, organization }));
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
    // @ts-ignore
    delete resource['privateMetadata'];
    // @ts-ignore
    delete resource['private_metadata'];
  }

  return resource;
}
