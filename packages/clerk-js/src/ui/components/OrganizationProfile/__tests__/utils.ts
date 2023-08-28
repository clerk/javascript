import type {
  MembershipRole,
  OrganizationDomainResource,
  OrganizationDomainVerification,
  OrganizationEnrollmentMode,
  OrganizationInvitationResource,
  OrganizationInvitationStatus,
  OrganizationMembershipRequestResource,
  OrganizationMembershipResource,
  OrganizationResource,
  PublicUserData,
} from '@clerk/types';
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

type FakeDomainParams = {
  id: string;
  name: string;
  organizationId: string;
  enrollmentMode?: OrganizationEnrollmentMode;
  verification?: OrganizationDomainVerification | null;
  createdAt?: Date;
  affiliationEmailAddress?: string | null;
};

export const createFakeDomain = (params: FakeDomainParams): OrganizationDomainResource => {
  return {
    destroy: jest.fn() as any,
    update: jest.fn() as any,
    id: params.id,
    name: params.name,
    verification: params.verification ?? null,
    organizationId: params.organizationId,
    enrollmentMode: params.enrollmentMode ?? 'manual_invitation',
    prepareAffiliationVerification: jest.fn() as any,
    attemptAffiliationVerification: jest.fn() as any,
    createdAt: params?.createdAt || new Date(),
    updatedAt: new Date(),
  } as any;
};

type FakeInvitationParams = {
  id: string;
  role?: MembershipRole;
  status?: OrganizationInvitationStatus;
  emailAddress: string;
  organizationId: string;
  createdAt?: Date;
};

export const createFakeOrganizationInvitation = (params: FakeInvitationParams): OrganizationInvitationResource => {
  return {
    pathRoot: '',
    id: params.id,
    emailAddress: params.emailAddress,
    organizationId: params.organizationId,
    publicMetadata: {} as any,
    role: params.role || 'basic_member',
    status: params.status || 'pending',
    createdAt: params?.createdAt || new Date(),
    updatedAt: new Date(),
    revoke: jest.fn as any,
    reload: jest.fn as any,
  };
};

type FakeMemberRequestParams = {
  id: string;
  publicUserData: Pick<PublicUserData, 'userId' | 'identifier'>;
  status?: OrganizationInvitationStatus;
  organizationId: string;
  createdAt?: Date;
};

export const createFakeOrganizationMembershipRequest = (
  params: FakeMemberRequestParams,
): OrganizationMembershipRequestResource => {
  return {
    pathRoot: '',
    id: params.id,
    organizationId: params.organizationId,
    publicUserData: {
      firstName: null,
      lastName: null,
      profileImageUrl: '',
      imageUrl: '',
      hasImage: false,
      userId: params.publicUserData.userId || '',
      identifier: params.publicUserData.identifier,
    },
    status: params.status || 'pending',
    createdAt: params?.createdAt || new Date(),
    updatedAt: new Date(),
    accept: jest.fn as any,
    reject: jest.fn as any,
    reload: jest.fn as any,
  };
};
