import { withCardStateProvider } from '@/ui/elements/contexts';
import type { FormProps } from '@/ui/elements/FormContainer';

import { useVerifyDomainFormController } from './verify-domain-form.controller';
import { useVerifyDomainFormModel } from './verify-domain-form.model';
import type { VerifyDomainFormModel } from './verify-domain-form.types';
import { VerifyDomainFormView, VerifyDomainLoadingView } from './verify-domain-form.view';

type VerifyDomainFormProps = FormProps & {
  domainId: string;
  skipToVerified: boolean;
};

export const VerifyDomainForm = (props: VerifyDomainFormProps) => {
  const model = useVerifyDomainFormModel(props.domainId, props.skipToVerified);
  return model.available ? (
    <VerifyDomainFormContent
      key={model.scope}
      {...props}
      model={model}
    />
  ) : null;
};

const VerifyDomainFormContent = withCardStateProvider(
  (props: VerifyDomainFormProps & { model: VerifyDomainFormModel }) => {
    const { model } = props;
    const controller = useVerifyDomainFormController(model, props.skipToVerified, props.onSuccess);
    if (model.isLoading) {
      return <VerifyDomainLoadingView />;
    }

    return (
      <VerifyDomainFormView
        controller={controller}
        domainId={props.domainId}
        onSuccess={props.onSuccess}
        onReset={props.onReset}
      />
    );
  },
);
