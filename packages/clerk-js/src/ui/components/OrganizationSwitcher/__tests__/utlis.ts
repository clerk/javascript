import { MembershipRole, OrganizationInvitationStatus, UserOrganizationInvitationResource } from '@clerk/types';
import { jest } from '@jest/globals';

type FakeOrganizationParams = {
  id: string;
  createdAt?: Date;
  emailAddress: string;
  role?: MembershipRole;
  status?: OrganizationInvitationStatus;
  publicOrganizationData?: { hasImage?: boolean; id?: string; imageUrl?: string; name?: string; slug?: string };
};

export const createFakeUserOrganizationInvitations = (
  params: FakeOrganizationParams,
): UserOrganizationInvitationResource => {
  return {
    pathRoot: '',
    emailAddress: params.emailAddress,
    publicOrganizationData: {
      hasImage: false,
      id: '',
      imageUrl: '',
      name: '',
      slug: '',
      ...params.publicOrganizationData,
    },
    role: params.role || 'basic_member',
    status: params.status || 'pending',
    id: params.id,
    createdAt: params?.createdAt || new Date(),
    updatedAt: new Date(),
    publicMetadata: {},
    accept: jest.fn() as any,
    reload: jest.fn() as any,
  };
};
