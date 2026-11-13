import { useOrganization } from '@clerk/shared/react';

import { useMosaicEnvironment } from '../../hooks/use-mosaic-environment';
import { useAPIKeysAccess } from '../api-keys/api-keys-table.model';
import type { OrganizationProfilePageId } from './organization-profile.types';
import { useMembersPanelAccessModel } from './organization-profile-members-panel/organization-profile-members-panel.model';

export type OrganizationProfileModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | { status: 'ready'; pages: OrganizationProfilePageId[] };

export function useOrganizationProfileModel(): OrganizationProfileModel {
  const { isLoaded, organization } = useOrganization();
  const environment = useMosaicEnvironment();
  const membersAccess = useMembersPanelAccessModel();
  const apiKeysAccess = useAPIKeysAccess(organization?.id);

  if (!isLoaded || !environment || membersAccess.status === 'loading' || !apiKeysAccess.isLoaded) {
    return { status: 'loading' };
  }
  if (!organization) {
    return { status: 'hidden' };
  }

  const pages: OrganizationProfilePageId[] = ['general'];
  if (membersAccess.status === 'ready') {
    pages.push('members');
  }
  if (apiKeysAccess.isAvailable) {
    pages.push('apiKeys');
  }
  return { status: 'ready', pages };
}
