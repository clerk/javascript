import { defineModalSurface } from '../../modals/define-modal-surface';
import type { UserProfileModalOptions } from './user-profile.modal.types';

export const userProfileModal = defineModalSurface<UserProfileModalOptions>({
  id: 'userProfile',
  variant: 'profile',
  load: () => import('./user-profile.modal-content'),
});
