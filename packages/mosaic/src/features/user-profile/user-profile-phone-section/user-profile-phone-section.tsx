import { useUserProfilePhoneSectionController } from './user-profile-phone-section.controller';
import { useUserProfilePhoneSectionModel } from './user-profile-phone-section.model';
import type { ReadyPhoneSectionModel } from './user-profile-phone-section.types';
import { UserProfilePhoneSectionView } from './user-profile-phone-section.view';

export function UserProfilePhoneSection() {
  const model = useUserProfilePhoneSectionModel();

  if (model.status !== 'ready') {
    return null;
  }

  return (
    <Phones
      key={model.userId}
      model={model}
    />
  );
}

function Phones({ model }: { model: ReadyPhoneSectionModel }) {
  const controller = useUserProfilePhoneSectionController(model);
  return <UserProfilePhoneSectionView {...controller} />;
}
