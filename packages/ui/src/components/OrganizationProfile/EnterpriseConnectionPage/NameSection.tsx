import { useActionContext } from '@/elements/Action/ActionRoot';
import { withCardStateProvider } from '@/elements/contexts';

import { useNameFormController } from './name-section.controller';
import { type NameSectionProps, useNameSectionModel } from './name-section.model';
import { NameFormView, NameSectionView } from './name-section.view';

export const NameSection = (props: NameSectionProps): JSX.Element => {
  const model = useNameSectionModel(props);
  return (
    <NameSectionView
      name={model.name}
      form={<NameScreen {...props} />}
    />
  );
};

const NameScreen = (props: NameSectionProps): JSX.Element => {
  const { close } = useActionContext();
  return (
    <NameForm
      {...props}
      onSuccess={close}
      onReset={close}
    />
  );
};

const NameForm = withCardStateProvider(
  (props: NameSectionProps & { onSuccess: () => void; onReset: () => void }): JSX.Element => {
    const model = useNameSectionModel(props);
    const controller = useNameFormController(model, props);
    return <NameFormView {...controller} />;
  },
);
