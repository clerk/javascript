import { withCardStateProvider } from '@/ui/elements/contexts';

import { useEmailFormController } from './email-form.controller';
import { useEmailFormModel } from './email-form.model';
import type { EmailFormData, EmailFormProps } from './email-form.types';
import { EmailFormView } from './email-form.view';
import { VerifyWithCode } from './VerifyWithCode';
import { VerifyWithEnterpriseConnection } from './VerifyWithEnterpriseConnection';
import { VerifyWithLink } from './VerifyWithLink';

export const EmailForm = (props: EmailFormProps) => {
  const model = useEmailFormModel(props);
  return (
    <EmailFormContent
      key={model.requestKey}
      model={model}
      {...props}
    />
  );
};

const EmailFormContent = withCardStateProvider(({ model, ...props }: EmailFormProps & { model: EmailFormData }) => {
  const controller = useEmailFormController(model, props);

  return (
    <EmailFormView
      controller={controller}
      verification={{
        emailCode: (
          <VerifyWithCode
            nextStep={controller.onSuccess}
            {...model.verification}
            onReset={controller.onReset}
          />
        ),
        emailLink: (
          <VerifyWithLink
            key={model.verification.requestKey}
            requestKey={model.verification.requestKey}
            canRun={model.verification.canRun}
            nextStep={controller.onSuccess}
            createFlow={model.createEmailLinkFlow}
            onReset={controller.onReset}
          />
        ),
        enterpriseSso: (
          <VerifyWithEnterpriseConnection
            key={model.verification.requestKey}
            requestKey={model.verification.requestKey}
            canRun={model.verification.canRun}
            nextStep={controller.onSuccess}
            createFlow={model.createEnterpriseSSOLinkFlow}
            onReset={controller.onReset}
          />
        ),
      }}
    />
  );
});
