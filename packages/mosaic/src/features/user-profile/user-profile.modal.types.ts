import type { ModalContentProps } from '../../modals/modal.types';
import type { UserProfileProps } from './user-profile';

export type UserProfileModalConfig = Pick<
  UserProfileProps,
  'customPages' | 'pageOrder' | 'additionalOAuthScopes' | 'apiKeysProps'
>;

export interface UserProfileModalPayload {
  page?: UserProfileProps['defaultPage'];
}

export type UserProfileModalContentProps = ModalContentProps<UserProfileModalConfig, UserProfileModalPayload>;
