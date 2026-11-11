import { defineModalSurface } from '../../modals/define-modal-surface';
import { pageParts } from '../profile-pages/profile-pages.layout';
import type { OrganizationProfileModalOptions } from './organization-profile.modal.types';

export const organizationProfileModal = defineModalSurface<OrganizationProfileModalOptions>({
  id: 'organizationProfile',
  variant: 'profile',
  load: () => import('./organization-profile.modal-content'),
  path: '/modal/organization',
  initialParts: options => pageParts(options?.page),
});
