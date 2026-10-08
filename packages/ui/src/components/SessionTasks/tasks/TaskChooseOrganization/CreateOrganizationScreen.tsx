import { withCardStateProvider } from '@/ui/elements/contexts';

import { useCreateOrganizationScreenController } from './create-organization-screen.controller';
import { useCreateOrganizationScreenModel } from './create-organization-screen.model';
import type { CreateOrganizationScreenData } from './create-organization-screen.types';
import { CreateOrganizationScreenView } from './create-organization-screen.view';
import type { OrganizationCreationDefaultsData } from './task-choose-organization.types';

type CreateOrganizationScreenProps = {
  onCancel?: () => void;
  organizationCreationDefaults?: OrganizationCreationDefaultsData | null;
};

export const CreateOrganizationScreen = (props: CreateOrganizationScreenProps) => {
  const model = useCreateOrganizationScreenModel(props.onCancel, props.organizationCreationDefaults);
  return (
    <CreateOrganizationScreenContent
      key={model.scopeKey}
      model={model}
      defaults={props.organizationCreationDefaults}
    />
  );
};

const CreateOrganizationScreenContent = withCardStateProvider(
  ({
    model,
    defaults,
  }: {
    model: CreateOrganizationScreenData;
    defaults?: OrganizationCreationDefaultsData | null;
  }) => {
    const controller = useCreateOrganizationScreenController(model, defaults);
    return (
      <CreateOrganizationScreenView
        {...controller}
        onCancel={model.onCancel}
        organizationCreationDefaults={defaults}
      />
    );
  },
);
