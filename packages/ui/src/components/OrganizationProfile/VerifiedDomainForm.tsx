import { useEffect } from 'react';

import { withCardStateProvider } from '@/ui/elements/contexts';
import type { FormProps } from '@/ui/elements/FormContainer';

import { useVerifiedDomainFormController } from './verified-domain-form.controller';
import { useVerifiedDomainFormModel } from './verified-domain-form.model';
import type { VerifiedDomainFormModel } from './verified-domain-form.types';
import { VerifiedDomainFormView } from './verified-domain-form.view';

type VerifiedDomainFormProps = FormProps & {
  domainId: string;
  mode?: 'select' | 'edit';
};

export const VerifiedDomainForm = (props: VerifiedDomainFormProps) => {
  const model = useVerifiedDomainFormModel(props.domainId);
  return model.available ? (
    <VerifiedDomainFormContent
      key={model.scope}
      {...props}
      model={model}
    />
  ) : null;
};

const VerifiedDomainFormContent = withCardStateProvider(
  (props: VerifiedDomainFormProps & { model: VerifiedDomainFormModel }) => {
    const { model, onReset } = props;
    const controller = useVerifiedDomainFormController(model, props.onSuccess, props.mode ?? 'edit');
    useEffect(() => {
      if (model.canRun() && !model.isLoading && !model.errorMessage && model.domain && !model.domain.isVerified) {
        onReset();
      }
    }, [model, onReset]);
    return (
      <VerifiedDomainFormView
        controller={controller}
        onReset={props.onReset}
      />
    );
  },
);
