import { withCardStateProvider } from '@/ui/elements/contexts';

import { useOrganizationProfileFormController } from './profile-form.controller';
import { useOrganizationProfileFormModel } from './profile-form.model';
import type { OrganizationProfileFormProps, OrganizationProfileFormReadyData } from './profile-form.types';
import { OrganizationProfileFormView } from './profile-form.view';

const ProfileFormReady = withCardStateProvider(({ model }: { model: OrganizationProfileFormReadyData }) => {
  const controller = useOrganizationProfileFormController(model);
  return <OrganizationProfileFormView {...controller} />;
});

export const ProfileForm = (props: OrganizationProfileFormProps) => {
  const model = useOrganizationProfileFormModel(props);
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
