import { useUserProfileEmailSectionController } from './user-profile-email-section.controller';
import { useUserProfileEmailSectionModel } from './user-profile-email-section.model';
import type { ReadyEmailSectionModel } from './user-profile-email-section.types';
import { UserProfileEmailSectionView } from './user-profile-email-section.view';

export function UserProfileEmailSection() {
  const model = useUserProfileEmailSectionModel();

  if (model.status !== 'ready') {
    return null;
  }

  return (
    <Emails
      key={model.userId}
      model={model}
    />
  );
}

function Emails({ model }: { model: ReadyEmailSectionModel }) {
  const controller = useUserProfileEmailSectionController(model);
  return <UserProfileEmailSectionView {...controller} />;
}
