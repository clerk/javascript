import type { ModalContentProps } from '../../modals/modal.types';
import type { CustomProfilePage, UserProfilePageId } from './user-profile.types';

export interface UserProfileModalConfig {
  customPages?: readonly CustomProfilePage[];
  pageOrder?: readonly (UserProfilePageId | (string & {}))[];
}

export interface UserProfileModalPayload {
  page?: UserProfilePageId | (string & {});
}

export type UserProfileModalContentProps = ModalContentProps<UserProfileModalConfig, UserProfileModalPayload>;
