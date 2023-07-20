import type { MembershipRole, OrganizationMembershipResource, OrganizationResource } from '@clerk/types';
import { jest } from '@jest/globals';

type FakeMemberParams = {
  id: string;
  orgId: string;
  role?: MembershipRole;
  identifier?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  imageUrl?: string;
  createdAt?: Date;
};

export const createFakeMember = (params: FakeMemberParams): OrganizationMembershipResource => {
  return {
    destroy: jest.fn() as any,
    update: jest.fn() as any,
    organization: { id: params.orgId } as any as OrganizationResource,
    id: params.id,
    role: params?.role || 'admin',
    createdAt: params?.createdAt || new Date(),
    updatedAt: new Date(),
    publicMetadata: {},
    publicUserData: {
      userId: params.id,
      identifier: params?.identifier || 'test_user',
      firstName: params?.firstName || 'test_firstName',
      lastName: params?.lastName || 'test_lastName',
      profileImageUrl: params?.profileImageUrl || '',
      imageUrl: params?.imageUrl || '',
    },
  } as any;
};
