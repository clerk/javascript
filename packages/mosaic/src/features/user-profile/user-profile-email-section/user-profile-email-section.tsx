import { useReverificationFlow } from '../../reverification';
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
  const [removeEmail, reverification] = useReverificationFlow((id: string) => model.onRemoveEmail?.(id));
  const controller = useUserProfileEmailSectionController({
    ...model,
    onRemoveEmail: model.onRemoveEmail ? removeEmail : undefined,
    reverification,
  });
  return <UserProfileEmailSectionView {...controller} />;
}
