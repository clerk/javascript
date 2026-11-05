import type { ModalContentProps } from '../../modals/modal.types';
import type { UserProfileProps } from './user-profile';
import type { UserProfileViewProps } from './user-profile.view';

export interface UserProfileModalOptions extends Pick<
  UserProfileProps,
  'customPages' | 'pageOrder' | 'additionalOAuthScopes' | 'apiKeysProps' | 'mode' | 'organizationProfileProps'
> {
  page?: UserProfileViewProps['activePage'];
}

export type UserProfileModalContentProps = ModalContentProps<UserProfileModalOptions>;
