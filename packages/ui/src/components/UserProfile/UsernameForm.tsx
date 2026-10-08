import { withCardStateProvider } from '@/ui/elements/contexts';

import { useUsernameFormController } from './username-form.controller';
import type { UsernameFormProps } from './username-form.model';
import { useUsernameFormModel } from './username-form.model';
import { UsernameFormView } from './username-form.view';

type ReadyModel = Extract<ReturnType<typeof useUsernameFormModel>, { status: 'ready' }>;

const UsernameFormReady = ({ model, props }: { model: ReadyModel; props: UsernameFormProps }) => {
  const controller = useUsernameFormController(model, props);
  return <UsernameFormView controller={controller} />;
};

export const UsernameForm = withCardStateProvider((props: UsernameFormProps) => {
  const model = useUsernameFormModel();
  if (model.status === 'hidden') {
    return null;
  }
  return (
    <UsernameFormReady
      model={model}
      props={props}
    />
  );
});
