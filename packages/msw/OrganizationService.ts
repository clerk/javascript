import type { OrganizationMembershipResource, OrganizationResource } from '@clerk/shared/types';

type MembershipRole = 'org:admin' | 'org:member';

export class OrganizationService {
  static create(overrides: Partial<OrganizationResource> = {}): OrganizationResource {
    const orgId = overrides.id || 'org_mock_default';

    return {
      adminDeleteEnabled: true,
      createdAt: new Date(),
      hasImage: false,
      id: orgId,
      imageUrl: '',
      maxAllowedMemberships: 100,
      membersCount: 3,
      name: 'Acme Inc',
      object: 'organization',
      pendingInvitationsCount: 0,
      publicMetadata: {},
      slug: 'acme-inc',
      updatedAt: new Date(),
      // Methods
      addMember: async () => ({}) as any,
      createDomain: async () => ({}) as any,
      destroy: async () => {},
      getDomains: async () => ({ data: [], totalCount: 0 }) as any,
      getInvitations: async () => ({ data: [], totalCount: 0 }) as any,
      getMembershipRequests: async () => ({ data: [], totalCount: 0 }) as any,
      getMemberships: async () => ({ data: [], totalCount: 0 }) as any,
      getRoles: async () => ({ data: [], totalCount: 0 }) as any,
      inviteMember: async () => ({}) as any,
      inviteMembers: async () => ({}) as any,
      removeMember: async () => ({}) as any,
      setLogo: async () => ({}) as any,
      update: async () => ({}) as any,
      __internal_toSnapshot: () => ({}) as any,
      ...overrides,
    } as unknown as OrganizationResource;
  }

  static createMembership(
    organization: OrganizationResource,
    userId: string,
    role: MembershipRole = 'org:admin',
    overrides: Partial<OrganizationMembershipResource> = {},
  ): OrganizationMembershipResource {
    const adminPermissions = [
      'org:sys_profile:manage',
      'org:sys_profile:delete',
      'org:sys_memberships:read',
      'org:sys_memberships:manage',
      'org:sys_domains:read',
      'org:sys_domains:manage',
    ];
    const memberPermissions = ['org:sys_profile:read', 'org:sys_memberships:read'];

    return {
      createdAt: new Date(),
      id: `orgmem_${organization.id}_${userId}`,
      object: 'organization_membership',
      organization,
      permissions: role === 'org:admin' ? adminPermissions : memberPermissions,
      publicMetadata: {},
      publicUserData: {
        firstName: 'Cameron',
        hasImage: false,
        identifier: 'example@personal.com',
        imageUrl: '',
        lastName: 'Walker',
        userId,
      },
      role,
      updatedAt: new Date(),
      destroy: async () => ({}) as any,
      update: async () => ({}) as any,
      __internal_toSnapshot: () => ({}) as any,
      ...overrides,
    } as unknown as OrganizationMembershipResource;
  }
}
