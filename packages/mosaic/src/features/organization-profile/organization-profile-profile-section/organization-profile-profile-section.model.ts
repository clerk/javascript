import { useClerk, useOrganization, useSession } from '@clerk/shared/react';
import type { OrganizationResource } from '@clerk/shared/types';

import { useMosaicEnvironment } from '../../../hooks/use-mosaic-environment';
import { MosaicError, UNEXPECTED_ERROR } from '../../../utils/errors';
import { ORGANIZATION_PERMISSIONS } from '../../../utils/permissions';
import { callClerk } from '../../clerk/errors';
import type { OrganizationProfileEditNameValue } from './organization-profile-edit-name.dialog';
import type { OrganizationProfileEditSlugValue } from './organization-profile-edit-slug.dialog';
import type { OrganizationProfileProfileSectionViewProps } from './organization-profile-profile-section.view';

const NAME_FIELDS: readonly (keyof OrganizationProfileEditNameValue)[] = ['name'];
const SLUG_FIELDS: readonly (keyof OrganizationProfileEditSlugValue)[] = ['slug'];

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
    Boolean(membership) &&
    (session?.checkAuthorization({ permission: ORGANIZATION_PERMISSIONS.profileManage }) ?? false);
  const currentOrganization = (): OrganizationResource => {
    const current = clerk.organization;
    if (!current || current.id !== organizationId) {
      throw new MosaicError([UNEXPECTED_ERROR]);
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
    onLogoChange: file =>
      callClerk(async () => {
        await currentOrganization().setLogo({ file });
      }),
    onRemoveLogo: organization.hasImage
      ? () =>
          callClerk(async () => {
            await currentOrganization().setLogo({ file: null });
          })
      : undefined,
    onSubmitName: name =>
      callClerk(
        async () => {
          await currentOrganization().update({ name });
        },
        { fields: NAME_FIELDS },
      ),
    onSubmitSlug: !environment.organizationSettings.slug.disabled
      ? slug =>
          callClerk(
            async () => {
              const current = currentOrganization();
              await current.update({ name: current.name, slug });
            },
            { fields: SLUG_FIELDS },
          )
      : undefined,
  };
}
