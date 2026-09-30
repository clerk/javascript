import { createModalHook } from '../../modals/create-modal-hook';
import type { UserProfileModalConfig, UserProfileModalPayload } from './user-profile.modal.types';

export const useUserProfileModal = createModalHook<UserProfileModalConfig, UserProfileModalPayload>(
  { id: 'userProfile', variant: 'profile', load: () => import('./user-profile.modal-content') },
  defaults => defaults.userProfile ?? {},
);
