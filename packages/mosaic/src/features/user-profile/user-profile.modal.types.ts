import type { ModalContentProps } from '../../modals/modal.types';
import type { CombinedProfileProps } from '../profile/profile';
import type { UserProfileViewProps } from './user-profile.view';

export interface UserProfileModalOptions extends Pick<
  CombinedProfileProps,
  'customPages' | 'pageOrder' | 'additionalOAuthScopes' | 'apiKeysProps' | 'organizationProfileProps'
> {
  combined?: boolean;
  page?: UserProfileViewProps['activePage'];
}

export type UserProfileModalContentProps = ModalContentProps<UserProfileModalOptions>;
