import type { Clerk } from '../core/clerk';
import {
  BillingPaymentMethod,
  Organization,
  OrganizationDomain,
  OrganizationInvitation,
  OrganizationMembership,
  OrganizationMembershipRequest,
  OrganizationSuggestion,
  SessionWithActivities,
  UserOrganizationInvitation,
} from '../core/resources/internal';
import { failure } from './errors';
import type { EmbeddedInvocation } from './types';

const resourceKinds = [
  [Organization, 'organization'],
  [OrganizationDomain, 'organizationDomain'],
  [OrganizationInvitation, 'organizationInvitation'],
  [OrganizationMembership, 'organizationMembership'],
  [OrganizationMembershipRequest, 'organizationMembershipRequest'],
  [OrganizationSuggestion, 'organizationSuggestion'],
  [SessionWithActivities, 'sessionWithActivities'],
  [UserOrganizationInvitation, 'userOrganizationInvitation'],
  [BillingPaymentMethod, 'billingPaymentMethod'],
] as const;

export function createResourceRegistry(clerk: Clerk, onResource: (value: unknown) => void) {
  const registry = new Map<string, object>();

  function remember(value: object) {
    const id: unknown = Reflect.get(value, 'id');
    if (typeof id !== 'string') {
      return;
    }
    for (const [type, kind] of resourceKinds) {
      if (value instanceof type) {
        registry.set(`${kind}:${id}`, value);
        return;
      }
    }
  }

  function serialize(value: unknown): unknown {
    if (value == null) {
      return null;
    }
    if (typeof value !== 'object') {
      return value;
    }
    if (value instanceof Date) {
      return value.getTime();
    }
    if (Array.isArray(value)) {
      return value.map(serialize);
    }
    remember(value);
    onResource(value);
    const organization: unknown = Reflect.get(value, 'organization');
    if (organization && typeof organization === 'object') {
      remember(organization);
    }
    const snapshot: unknown = Reflect.get(value, '__internal_toSnapshot');
    if (typeof snapshot === 'function') {
      return Reflect.apply(snapshot, value, []);
    }
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key, entry]) => key !== 'pathRoot' && typeof entry !== 'function')
        .map(([key, entry]) => [key, serialize(entry)]),
    );
  }

  async function resolve(receiver: EmbeddedInvocation['receiver'], method: string): Promise<object | null | undefined> {
    const find = (items?: readonly { id: string }[]) => items?.find(item => item.id === receiver.id);
    switch (receiver.kind) {
      case 'clerk':
        return clerk;
      case 'signIn':
        return clerk.client?.signIn;
      case 'signUp':
        return clerk.client?.signUp;
      case 'user':
        return clerk.user;
      case 'billing':
        return clerk.billing;
      case 'userResource': {
        const collection: unknown = clerk.user && Reflect.get(clerk.user, receiver.collection || '');
        return Array.isArray(collection) ? find(collection) : undefined;
      }
      case 'session': {
        const session = find(clerk.client?.sessions);
        if (session && typeof Reflect.get(session, method) === 'function') {
          return session;
        }
        let listed = registry.get(`sessionWithActivities:${receiver.id}`);
        if (!listed && clerk.user) {
          serialize(await clerk.user.getSessions());
          listed = registry.get(`sessionWithActivities:${receiver.id}`);
        }
        return listed;
      }
      case 'organization':
        return (
          clerk.user?.organizationMemberships.find(m => m.organization.id === receiver.id)?.organization ||
          registry.get(`organization:${receiver.id}`) ||
          (await clerk.getOrganization(receiver.id || ''))
        );
      case 'listed':
        return registry.get(`${receiver.scope || receiver.listedKind}:${receiver.id}`);
      default:
        return failure('unknown_receiver', 'Unknown Clerk resource');
    }
  }

  return {
    serialize,
    resolve,
    clear: () => registry.clear(),
    forget: (receiver: EmbeddedInvocation['receiver']) =>
      registry.delete(`${receiver.scope || receiver.listedKind}:${receiver.id}`),
  };
}
