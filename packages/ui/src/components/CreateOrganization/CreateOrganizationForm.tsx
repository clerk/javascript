import { withCardStateProvider } from '@/ui/elements/contexts';

import { useCreateOrganizationFormController } from './create-organization-form.controller';
import { type CreateOrganizationFormProps, useCreateOrganizationFormModel } from './create-organization-form.model';
import type { CreateOrganizationFormData } from './create-organization-form.types';
import { CreateOrganizationFormView } from './create-organization-form.view';

export const CreateOrganizationForm = (props: CreateOrganizationFormProps) => {
  const model = useCreateOrganizationFormModel(props);
  return (
    <CreateOrganizationFormContent
      key={model.scopeKey}
      model={model}
    />
  );
};

const CreateOrganizationFormContent = withCardStateProvider(({ model }: { model: CreateOrganizationFormData }) => {
  const controller = useCreateOrganizationFormController(model);
  return <CreateOrganizationFormView {...controller} />;
});
