import type { ModalContentProps } from '../../modals/modal.types';
import type { UserProfileProps } from './user-profile';

export interface UserProfileModalOptions extends Pick<
  UserProfileProps,
  'customPages' | 'pageOrder' | 'additionalOAuthScopes' | 'apiKeysProps' | 'mode' | 'organizationProfileProps'
> {
  page?: UserProfileProps['defaultPage'];
}

export type UserProfileModalContentProps = ModalContentProps<UserProfileModalOptions>;
