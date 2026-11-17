import { defineModalSurface } from '../../modals/define-modal-surface';
import { pageParts } from '../profile-pages/profile-pages.layout';
import type { ProfileModalOptions } from './profile.modal.types';

export const profileModal = defineModalSurface<ProfileModalOptions>({
  id: 'profile',
  variant: 'profile',
  load: () => import('./profile.modal-content'),
  path: '/modal/profile',
  initialParts: options => pageParts(options?.page),
});
