import { createModalHook } from '../../modals/create-modal-hook';
import type {
  OrganizationProfileModalConfig,
  OrganizationProfileModalPayload,
} from './organization-profile.modal.types';

export const useOrganizationProfileModal = createModalHook<
  OrganizationProfileModalConfig,
  OrganizationProfileModalPayload
>(
  { id: 'organizationProfile', variant: 'profile', load: () => import('./organization-profile.modal-content') },
  defaults => defaults.organizationProfile ?? {},
);
