import { useClerk, useOrganization, useSession } from '@clerk/shared/react';
import type { OrganizationResource } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../../hooks/use-mosaic-environment';
import { save, SaveError, UNEXPECTED_ERROR } from '../../../utils/errors';
import type { OrganizationProfileProfileSectionViewProps } from './organization-profile-profile-section.view';

type OrganizationProfileProfileSectionModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | (OrganizationProfileProfileSectionViewProps & { status: 'ready'; organizationId: string });

export function useOrganizationProfileProfileSectionModel(): OrganizationProfileProfileSectionModel {
  const { isLoaded, organization, membership } = useOrganization();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const clerk = useClerk();
  const environment = useMosaicEnvironment();

  if (!isLoaded || !isSessionLoaded || !environment) {
    return { status: 'loading' };
  }
  if (!organization) {
    return { status: 'hidden' };
  }

  const organizationId = organization.id;
  const canManage =
    Boolean(membership) && (session?.checkAuthorization({ permission: 'org:sys_profile:manage' }) ?? false);
  const currentOrganization = (): OrganizationResource => {
    const current = clerk.organization;
    if (!current || current.id !== organizationId) {
      throw new SaveError({ global: UNEXPECTED_ERROR });
    }
    return current;
  };

  const profile = {
    status: 'ready' as const,
    organizationId,
    name: organization.name,
    slug: environment.organizationSettings.slug.disabled ? undefined : (organization.slug ?? ''),
    imageUrl: organization.imageUrl,
    hasImage: organization.hasImage,
  };
  if (!canManage) {
    return profile;
  }

  return {
    ...profile,
    onLogoChange: file => save(() => currentOrganization().setLogo({ file })),
    onRemoveLogo: organization.hasImage ? () => save(() => currentOrganization().setLogo({ file: null })) : undefined,
    onSubmitName: name => save(() => currentOrganization().update({ name }), ['name']),
    onSubmitSlug: !environment.organizationSettings.slug.disabled
      ? slug =>
          save(() => {
            const current = currentOrganization();
            return current.update({ name: current.name, slug });
          }, ['slug'])
      : undefined,
  };
}
