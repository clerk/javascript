import { withCardStateProvider } from '@/ui/elements/contexts';
import type { FormProps } from '@/ui/elements/FormContainer';

import { useAddDomainFormController } from './add-domain-form.controller';
import { useAddDomainFormModel } from './add-domain-form.model';
import type { AddDomainFormModel } from './add-domain-form.types';
import { AddDomainFormView } from './add-domain-form.view';

type AddDomainFormProps = FormProps;

export const AddDomainForm = (props: AddDomainFormProps) => {
  const model = useAddDomainFormModel();
  return model.available ? (
    <AddDomainFormContent
      key={model.scope}
      {...props}
      model={model}
    />
  ) : null;
};

const AddDomainFormContent = withCardStateProvider((props: AddDomainFormProps & { model: AddDomainFormModel }) => {
  const controller = useAddDomainFormController(props.model, props.onSuccess);
  return (
    <AddDomainFormView
      controller={controller}
      onReset={props.onReset}
    />
  );
});
