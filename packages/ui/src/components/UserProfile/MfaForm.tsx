import { CardStateProvider } from '@/ui/elements/contexts';

import { useMfaFormController } from './mfa-form.controller';
import type { MfaFormProps } from './mfa-form.model';
import { useMfaFormModel } from './mfa-form.model';
import { MfaFormView } from './mfa-form.view';

export const MfaForm = (props: MfaFormProps) => {
  const model = useMfaFormModel();
  if (model.status !== 'ready') {
    return null;
  }

  return (
    <CardStateProvider key={model.userId}>
      <MfaFormContent
        methods={model.methods}
        props={props}
      />
    </CardStateProvider>
  );
};

const MfaFormContent = ({
  methods,
  props,
}: {
  methods: Extract<ReturnType<typeof useMfaFormModel>, { status: 'ready' }>['methods'];
  props: MfaFormProps;
}) => {
  const controller = useMfaFormController(methods, props);

  return (
    <MfaFormView
      hasError={controller.hasError}
      method={controller.method}
      onSuccess={controller.onSuccess}
      onReset={controller.onReset}
    />
  );
};
