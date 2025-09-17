import type {
  OrganizationCustomRoleKey,
  OrganizationInvitationStatus,
  OrganizationMembershipResource,
  OrganizationSuggestionResource,
  OrganizationSuggestionStatus,
  UserOrganizationInvitationResource,
} from '@clerk/types';
import { vi } from 'vitest';

import type { FakeOrganizationParams } from '../../CreateOrganization/__tests__/CreateOrganization.test';
import { createFakeOrganization } from '../../CreateOrganization/__tests__/CreateOrganization.test';

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
