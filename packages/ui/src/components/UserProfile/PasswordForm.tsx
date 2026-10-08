import { withCardStateProvider } from '@/ui/elements/contexts';

import { usePasswordFormController } from './password-form.controller';
import type { PasswordFormProps } from './password-form.model';
import { usePasswordFormModel } from './password-form.model';
import { PasswordFormView } from './password-form.view';

type ReadyModel = Extract<ReturnType<typeof usePasswordFormModel>, { status: 'ready' }>;

const PasswordFormReady = ({ model, props }: { model: ReadyModel; props: PasswordFormProps }) => {
  const controller = usePasswordFormController(model, props);
  return <PasswordFormView controller={controller} />;
};

export const PasswordForm = withCardStateProvider((props: PasswordFormProps) => {
  const model = usePasswordFormModel();
  if (model.status === 'hidden') {
    return null;
  }
  return (
    <PasswordFormReady
      model={model}
      props={props}
    />
  );
});
