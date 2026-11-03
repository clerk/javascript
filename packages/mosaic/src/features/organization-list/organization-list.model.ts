import { ClerkRuntimeError, isClerkAPIResponseError } from '@clerk/shared/error';
import { useClerk, useUser } from '@clerk/shared/react';
import type { OrganizationListProps } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { replaceInPages, shrinkTotal } from '../../utils/infinite-pages';
import type { CreateOrganizationModel } from '../create-organization/create-organization.model';
import { useCreateOrganizationModel } from '../create-organization/create-organization.model';
import { resolveAfterUrl } from '../switcher/switcher.model';
import { useOrganizationListInView } from '../switcher/use-organization-list-in-view';
import type {
  OrganizationListData,
  OrganizationListInvitation,
  OrganizationListMembership,
  OrganizationListSuggestion,
} from './organization-list.types';

export type OrganizationListModelOptions = Pick<
  OrganizationListProps,
  | 'afterCreateOrganizationUrl'
  | 'afterSelectOrganizationUrl'
  | 'afterSelectPersonalUrl'
  | 'hidePersonal'
  | 'skipInvitationScreen'
>;

export type OrganizationListModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | (OrganizationListData & {
      status: 'ready';
      createOrganization?: Extract<CreateOrganizationModel, { status: 'ready' }>;
      onSelectOrganization: (organizationId: string | null) => Promise<unknown>;
      onAcceptInvitation: (invitationId: string) => Promise<unknown>;
      onAcceptSuggestion: (suggestionId: string) => Promise<unknown>;
    });

const UNAVAILABLE_ORGANIZATION_CODES = ['organization_not_found_or_unauthorized', 'not_a_member_in_organization'];

function unavailableOrganization(error: unknown, createOrganizationEnabled: boolean): unknown {
  if (
    createOrganizationEnabled ||
    !isClerkAPIResponseError(error) ||
    !UNAVAILABLE_ORGANIZATION_CODES.includes(error.errors[0]?.code ?? '')
  ) {
    return error;
  }
  return new ClerkRuntimeError(error.message, {
    code: 'organization_not_found_or_unauthorized_with_create_organization_disabled',
    cause: error,
  });
}

export function useOrganizationListModel(options: OrganizationListModelOptions = {}): OrganizationListModel {
  const { isLoaded: isUserLoaded, user } = useUser();
  const clerk = useClerk();
  const environment = useMosaicEnvironment();
  const createOrganization = useCreateOrganizationModel({
    afterCreateOrganizationUrl: options.afterCreateOrganizationUrl,
    skipInvitationScreen: options.skipInvitationScreen,
  });
  const { userMemberships, userInvitations, userSuggestions, ref } = useOrganizationListInView();

  if (!isUserLoaded || !environment) {
    return { status: 'loading' };
  }

  if (!user) {
    return { status: 'hidden' };
  }

  if (createOrganization.status === 'loading') {
    return { status: 'loading' };
  }

  const membershipData = userMemberships.data ?? [];
  const invitationData = userInvitations.data?.filter(Boolean) ?? [];
  const suggestionData = userSuggestions.data?.filter(Boolean) ?? [];

  const memberships: OrganizationListMembership[] = membershipData.map(({ organization }) => ({
    kind: 'membership',
    organizationId: organization.id,
    name: organization.name,
    imageUrl: organization.imageUrl || undefined,
  }));

  const invitations: OrganizationListInvitation[] = userMemberships.hasNextPage
    ? []
    : invitationData.flatMap(i =>
        i.status === 'pending' || i.status === 'accepted'
          ? [
              {
                kind: 'invitation',
                id: i.id,
                organizationId: i.publicOrganizationData.id,
                name: i.publicOrganizationData.name,
                imageUrl: i.publicOrganizationData.imageUrl || undefined,
                status: i.status,
              },
            ]
          : [],
      );

  const suggestions: OrganizationListSuggestion[] =
    userMemberships.hasNextPage || userInvitations.hasNextPage
      ? []
      : suggestionData.map(s => ({
          kind: 'suggestion',
          id: s.id,
          organizationId: s.publicOrganizationData.id,
          name: s.publicOrganizationData.name,
          imageUrl: s.publicOrganizationData.imageUrl || undefined,
          status: s.status,
        }));

  const afterSelectUrl = async (organizationId: string | null): Promise<string | undefined> => {
    if (!organizationId) {
      return resolveAfterUrl(options.afterSelectPersonalUrl, user);
    }
    if (!options.afterSelectOrganizationUrl) {
      return undefined;
    }
    const selected =
      membershipData.find(m => m.organization.id === organizationId)?.organization ??
      (await clerk.getOrganization(organizationId));
    return resolveAfterUrl(options.afterSelectOrganizationUrl, selected);
  };

  return {
    status: 'ready',
    applicationName: environment.displayConfig.applicationName,
    renderBranding: environment.displayConfig.branded,
    hidePersonal: environment.organizationSettings.forceOrganizationSelection || (options.hidePersonal ?? false),
    personalImageUrl: user.imageUrl || undefined,
    organizationsLoading: userMemberships.isLoading || userInvitations.isLoading || userSuggestions.isLoading,
    memberships,
    invitations,
    suggestions,
    paging: {
      ref,
      hasMore: Boolean(userMemberships.hasNextPage || userInvitations.hasNextPage || userSuggestions.hasNextPage),
    },
    createOrganization:
      createOrganization.status === 'ready' && user.createOrganizationEnabled ? createOrganization : undefined,
    onSelectOrganization: async organizationId => {
      try {
        await clerk.setActive({ organization: organizationId, redirectUrl: await afterSelectUrl(organizationId) });
      } catch (error) {
        throw unavailableOrganization(error, user.createOrganizationEnabled);
      }
    },
    onAcceptInvitation: async invitationId => {
      const invitation = invitationData.find(i => i.id === invitationId);
      try {
        const accepted = await invitation?.accept();
        if (accepted) {
          await userInvitations.setData?.(pages => shrinkTotal(replaceInPages(pages ?? [], accepted)));
        }
      } catch (error) {
        await Promise.allSettled([userInvitations.revalidate?.(), userMemberships.revalidate?.()]);
        throw error;
      }
    },
    onAcceptSuggestion: async suggestionId => {
      const suggestion = suggestionData.find(s => s.id === suggestionId);
      try {
        const accepted = await suggestion?.accept();
        if (accepted) {
          await userSuggestions.setData?.(pages => replaceInPages(pages ?? [], accepted));
        }
      } catch (error) {
        await Promise.allSettled([userSuggestions.revalidate?.()]);
        throw error;
      }
    },
  };
}
