import { defineModalSurface } from '../../modals/define-modal-surface';
import type { OrganizationProfileModalOptions } from './organization-profile.modal.types';

export const organizationProfileModal = defineModalSurface<OrganizationProfileModalOptions>({
  id: 'organizationProfile',
  variant: 'profile',
  load: () => import('./organization-profile.modal-content'),
});
