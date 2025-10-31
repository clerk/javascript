import type {
  OrganizationCustomRoleKey,
  OrganizationInvitationStatus,
  OrganizationMembershipResource,
  OrganizationResource,
  OrganizationSuggestionResource,
  OrganizationSuggestionStatus,
  UserOrganizationInvitationResource,
} from '@clerk/shared/types';
import { vi } from 'vitest';

export type FakeOrganizationParams = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  membersCount: number;
  pendingInvitationsCount: number;
  adminDeleteEnabled: boolean;
  maxAllowedMemberships: number;
  createdAt?: Date;
};

export const createFakeOrganization = (params: FakeOrganizationParams): OrganizationResource => {
  return {
    pathRoot: '',
    id: params.id,
    name: params.name,
    slug: params.slug,
    hasImage: !!params.imageUrl,
    imageUrl: params.imageUrl || '',
    membersCount: params.membersCount,
    pendingInvitationsCount: params.pendingInvitationsCount,
    publicMetadata: {},
    adminDeleteEnabled: params.adminDeleteEnabled,
    maxAllowedMemberships: params?.maxAllowedMemberships,
    createdAt: params?.createdAt || new Date(),
    updatedAt: new Date(),
    update: vi.fn() as any,
    getMemberships: vi.fn() as any,
    addMember: vi.fn() as any,
    inviteMember: vi.fn() as any,
    inviteMembers: vi.fn() as any,
    updateMember: vi.fn() as any,
    removeMember: vi.fn() as any,
    createDomain: vi.fn() as any,
    getDomain: vi.fn() as any,
    getDomains: vi.fn() as any,
    getMembershipRequests: vi.fn() as any,
    destroy: vi.fn() as any,
    setLogo: vi.fn() as any,
    reload: vi.fn() as any,
  };
};

type FakeOrganizationInvitationParams = {
  id: string;
  createdAt?: Date;
  emailAddress: string;
  role?: OrganizationCustomRoleKey;
  status?: OrganizationInvitationStatus;
  publicOrganizationData?: { hasImage?: boolean; id?: string; imageUrl?: string; name?: string; slug?: string };
};

export const createFakeUserOrganizationInvitation = (
  params: FakeOrganizationInvitationParams,
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
    accept: vi.fn() as any,
    reload: vi.fn() as any,
  };
};

type FakeUserOrganizationMembershipParams = {
  id: string;
  createdAt?: Date;
  role?: OrganizationCustomRoleKey;
  organization: FakeOrganizationParams;
};

export const createFakeUserOrganizationMembership = (
  params: FakeUserOrganizationMembershipParams,
): OrganizationMembershipResource => {
  return {
    organization: createFakeOrganization(params.organization),
    pathRoot: '',
    role: params.role || 'basic_member',
    permissions: [],
    id: params.id,
    createdAt: params?.createdAt || new Date(),
    updatedAt: new Date(),
    publicMetadata: {},
    publicUserData: {} as any,
    update: vi.fn() as any,
    destroy: vi.fn() as any,
    reload: vi.fn() as any,
  };
};

type FakeOrganizationSuggestionParams = {
  id: string;
  createdAt?: Date;
  emailAddress: string;
  role?: OrganizationCustomRoleKey;
  status?: OrganizationSuggestionStatus;
  publicOrganizationData?: { hasImage?: boolean; id?: string; imageUrl?: string; name?: string; slug?: string };
};

export const createFakeUserOrganizationSuggestion = (
  params: FakeOrganizationSuggestionParams,
): OrganizationSuggestionResource => {
  return {
    pathRoot: '',
    publicOrganizationData: {
      hasImage: false,
      id: '',
      imageUrl: '',
      name: '',
      slug: '',
      ...params.publicOrganizationData,
    },
    status: params.status || 'pending',
    id: params.id,
    createdAt: params?.createdAt || new Date(),
    updatedAt: new Date(),
    accept: vi.fn() as any,
    reload: vi.fn() as any,
  };
};
