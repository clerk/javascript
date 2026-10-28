import { ClerkRuntimeError } from '@clerk/shared/error';
import { useClerk, useOrganizationList, useUser } from '@clerk/shared/react';
import type { CreateOrganizationProps, OrganizationResource } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { useMosaicRouter } from '../../hooks/use-mosaic-router';
import { save } from '../../utils/errors';
import { rejectedEmailAddresses } from '../organization-profile/organization-profile-members-panel/invitations-table-tab.model';
import { resolveAfterUrl } from '../switcher/switcher.model';
import type {
  CreatedOrganization,
  CreateOrganizationInviteInput,
  CreateOrganizationValues,
} from './create-organization.types';

export type CreateOrganizationModelOptions = Pick<
  CreateOrganizationProps,
  'afterCreateOrganizationUrl' | 'skipInvitationScreen'
>;

export type CreateOrganizationModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      slugEnabled: boolean;
      renderBranding: boolean;
      onCreate: (values: CreateOrganizationValues) => Promise<CreatedOrganization>;
      onInvite: (organizationId: string, input: CreateOrganizationInviteInput) => Promise<void>;
      onComplete: (organizationId: string) => void;
    };

export function useCreateOrganizationModel(options: CreateOrganizationModelOptions = {}): CreateOrganizationModel {
  const { isLoaded: isUserLoaded, user } = useUser();
  const {
    isLoaded: isListLoaded,
    createOrganization,
    userMemberships,
  } = useOrganizationList({ userMemberships: { infinite: true } });
  const clerk = useClerk();
  const environment = useMosaicEnvironment();
  const router = useMosaicRouter();

  if (!isUserLoaded || !environment) {
    return { status: 'loading' };
  }

  if (!user) {
    return { status: 'hidden' };
  }

  if (!isListLoaded) {
    return { status: 'loading' };
  }

  const slugEnabled = !environment.organizationSettings.slug.disabled;

  const activeOrganization = (organizationId: string): OrganizationResource => {
    const current = clerk.organization;
    if (!current || current.id !== organizationId) {
      throw new ClerkRuntimeError('The active organization changed.', { code: 'organization_changed' });
    }
    return current;
  };

  const afterCreateUrl = async (organizationId: string): Promise<string | undefined> => {
    if (!options.afterCreateOrganizationUrl) {
      return environment.displayConfig.afterCreateOrganizationUrl || undefined;
    }
    const organization =
      clerk.organization?.id === organizationId ? clerk.organization : await clerk.getOrganization(organizationId);
    return resolveAfterUrl(options.afterCreateOrganizationUrl, organization);
  };

  return {
    status: 'ready',
    slugEnabled,
    renderBranding: environment.displayConfig.branded,
    onCreate: async ({ name, slug, logo }) => {
      let organization: OrganizationResource | undefined;
      await save(async () => {
        organization = await createOrganization({ name, ...(slugEnabled ? { slug } : {}) });
        if (logo) {
          await organization.setLogo({ file: logo });
        }
        await clerk.setActive({ organization });
      }, ['name', 'slug']);
      void userMemberships.revalidate?.();
      if (!organization) {
        throw new ClerkRuntimeError('The organization was not created.', { code: 'generic' });
      }
      return {
        organizationId: organization.id,
        skipInvitations: options.skipInvitationScreen ?? organization.maxAllowedMemberships === 1,
      };
    },
    onInvite: (organizationId, { emailAddresses, role, onRejected }) =>
      save(async () => {
        const organization = activeOrganization(organizationId);
        try {
          await organization.inviteMembers({ emailAddresses, role });
        } catch (cause) {
          onRejected(rejectedEmailAddresses(cause, emailAddresses));
          throw cause;
        }
      }),
    onComplete: organizationId => {
      void afterCreateUrl(organizationId).then(url => (url ? router.navigate(url) : undefined));
    },
  };
}
