import { withCardStateProvider } from '@/ui/elements/contexts';

import { useProfileFormController } from './profile-form.controller';
import { useProfileFormModel } from './profile-form.model';
import type { ProfileFormProps, ProfileFormReadyData } from './profile-form.types';
import { ProfileFormView } from './profile-form.view';

const ProfileFormReady = withCardStateProvider(({ model }: { model: ProfileFormReadyData }) => {
  const controller = useProfileFormController(model);
  return <ProfileFormView {...controller} />;
});

export const ProfileForm = (props: ProfileFormProps) => {
  const model = useProfileFormModel(props);
  if (model.status === 'hidden') {
    return null;
  }
  return (
    <ProfileFormReady
      key={model.scopeKey}
      model={model}
    />
  );
};
