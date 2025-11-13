import type {
  ClientResource,
  ListenerCallback,
  OrganizationInvitationResource,
  OrganizationMembershipResource,
  OrganizationResource,
  Resources,
  SessionResource,
  UserResource,
} from '@clerk/shared/types';

import { Client, Session, User } from '../core/resources/internal';

type AcceptedResource =
  | UserResource
  | ClientResource
  | SessionResource
  | OrganizationResource
  | OrganizationMembershipResource
  | OrganizationInvitationResource;

function clientChanged(prev: ClientResource, next: ClientResource): boolean {
  return (
    prev.id !== next.id ||
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    prev.updatedAt!.getTime() < next.updatedAt!.getTime() ||
    prev.sessions.length !== next.sessions.length
  );
}

function sessionChanged(prev: SessionResource, next: SessionResource): boolean {
  return (
    prev.id !== next.id ||
    prev.updatedAt.getTime() < next.updatedAt.getTime() ||
    // TODO: Optimize this to once JWT v2 formatting is out.
    prev.lastActiveToken?.jwt?.claims?.__raw !== next.lastActiveToken?.jwt?.claims?.__raw ||
    sessionUserMembershipPermissionsChanged(prev, next) ||
    sessionUserChanged(prev, next)
  );
}

function userChanged(prev: UserResource, next: UserResource): boolean {
  return (
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    prev.id !== next.id || prev.updatedAt!.getTime() < next.updatedAt!.getTime() || userMembershipsChanged(next, prev)
  );
}

/** User memberships update condition since the user.updatedAt will not be revalidated on organization removals/additions etc. */
function userMembershipsChanged(prev: UserResource, next: UserResource): boolean {
  return (
    prev.organizationMemberships.length !== next.organizationMemberships.length ||
    prev.organizationMemberships[0]?.updatedAt !== next.organizationMemberships[0]?.updatedAt
  );
}

function sessionUserChanged(prev: SessionResource, next: SessionResource): boolean {
  if (!!prev.user !== !!next.user) {
    return true;
  }
  return !!prev.user && !!next.user && userChanged(prev.user, next.user);
}

function sessionUserMembershipPermissionsChanged(prev: SessionResource, next: SessionResource): boolean {
  if (prev.lastActiveOrganizationId !== next.lastActiveOrganizationId) {
    return true;
  }

  const prevActiveMembership = prev.user?.organizationMemberships?.find(
    mem => mem.organization.id === prev.lastActiveOrganizationId,
  );

  const nextActiveMembership = next.user?.organizationMemberships?.find(
    mem => mem.organization.id === prev.lastActiveOrganizationId,
  );

  return prevActiveMembership?.permissions?.length !== nextActiveMembership?.permissions?.length;
}

// TODO: Decide if this belongs in the resources
function resourceChanged<T extends AcceptedResource | undefined | null>(prev: T, next: T): boolean {
  // support the setSession undefined intermediate state
  if ((!prev && !!next) || (!!prev && !next)) {
    return true;
  }

  if (!prev && prev === next) {
    return false;
  }

  // Help TS infer types correctly
  if (!prev || !next) {
    return true;
  }

  try {
    if (Client.isClientResource(prev)) {
      return clientChanged(prev, next as ClientResource);
    }

    if (Session.isSessionResource(prev)) {
      return sessionChanged(prev, next as SessionResource);
    }

    if (User.isUserResource(prev)) {
      return userChanged(prev, next as UserResource);
    }
  } catch {
    // If something goes terribly wrong, prefer doing an unnecessary rerender
    return true;
  }

  return true;
}

function getSameOrUpdatedResource<
  T extends
    | UserResource
    | ClientResource
    | SessionResource
    | OrganizationResource
    | OrganizationInvitationResource
    | OrganizationMembershipResource
    | undefined
    | null,
>(prev: T, next: T): T {
  return resourceChanged(prev, next) ? next : prev;
}

function stateWithMemoizedResources(cur: Resources, next: Resources): Resources {
  return {
    client: getSameOrUpdatedResource(cur.client, next.client),
    session: getSameOrUpdatedResource(cur.session, next.session),
    user: getSameOrUpdatedResource(cur.user, next.user),
    organization: getSameOrUpdatedResource(cur.organization, next.organization),
  };
}

export function memoizeListenerCallback(cb: ListenerCallback): ListenerCallback {
  let memo: Resources;
  return e => {
    memo ||= { ...e };
    memo = { ...stateWithMemoizedResources(memo, e) };
    cb(memo);
  };
}
