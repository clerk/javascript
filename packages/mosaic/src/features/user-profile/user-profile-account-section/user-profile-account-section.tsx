import { Reverification } from '../../reverification';
import { useUserProfileAccountSectionModel } from './user-profile-account-section.model';
import { UserProfileAccountSectionView } from './user-profile-account-section.view';

export function UserProfileAccountSection() {
  const model = useUserProfileAccountSectionModel();

  if (model.status !== 'ready') {
    return null;
  }

  const { status: _status, reverification, ...viewProps } = model;

  return (
    <>
      <UserProfileAccountSectionView {...viewProps} />
      <Reverification {...reverification} />
    </>
  );
}
