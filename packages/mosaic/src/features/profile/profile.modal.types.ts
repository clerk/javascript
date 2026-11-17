import type { ModalContentProps } from '../../modals/modal.types';
import type { UserProfileModalOptions } from '../user-profile/user-profile.modal.types';
import type { CombinedProfileProps } from './profile';

export interface ProfileModalOptions
  extends UserProfileModalOptions, Pick<CombinedProfileProps, 'organizationProfileProps'> {}

export type ProfileModalContentProps = ModalContentProps<ProfileModalOptions>;
