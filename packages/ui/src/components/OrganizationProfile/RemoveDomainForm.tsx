import type { FormProps } from '@/ui/elements/FormContainer';

import { useRemoveDomainFormModel } from './remove-domain-form.model';
import { RemoveDomainFormView } from './remove-domain-form.view';

type RemoveDomainFormProps = FormProps & {
  domainId: string;
};

export const RemoveDomainForm = (props: RemoveDomainFormProps) => {
  const model = useRemoveDomainFormModel(props.domainId);

  if (!model.available) {
    return null;
  }

  return (
    <RemoveDomainFormView
      key={model.scope}
      data={model}
      onSuccess={props.onSuccess}
      onReset={props.onReset}
    />
  );
};
