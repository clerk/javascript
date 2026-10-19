import { createModalHook } from '../../modals/create-modal-hook';
import type { UserProfileModalOptions } from './user-profile.modal.types';

export const useUserProfileModal = createModalHook<UserProfileModalOptions>(
  { id: 'userProfile', variant: 'profile', load: () => import('./user-profile.modal-content') },
  defaults => defaults.userProfile ?? {},
);
