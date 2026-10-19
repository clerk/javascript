import { createModalHook } from '../../modals/create-modal-hook';
import type { OrganizationProfileModalOptions } from './organization-profile.modal.types';

export const useOrganizationProfileModal = createModalHook<OrganizationProfileModalOptions>(
  { id: 'organizationProfile', variant: 'profile', load: () => import('./organization-profile.modal-content') },
  defaults => defaults.organizationProfile ?? {},
);
