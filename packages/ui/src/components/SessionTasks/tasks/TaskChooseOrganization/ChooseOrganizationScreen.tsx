import { useCardState } from '@/ui/elements/contexts';

import { useChooseOrganizationScreenModel } from './choose-organization-screen.model';
import { ChooseOrganizationScreenView } from './choose-organization-screen.view';

type ChooseOrganizationScreenProps = {
  onCreateOrganizationClick: () => void;
};

export const ChooseOrganizationScreen = (props: ChooseOrganizationScreenProps) => {
  const model = useChooseOrganizationScreenModel();
  const { error } = useCardState();
  return (
    <ChooseOrganizationScreenView
      {...model}
      error={error}
      onCreateOrganizationClick={props.onCreateOrganizationClick}
    />
  );
};
