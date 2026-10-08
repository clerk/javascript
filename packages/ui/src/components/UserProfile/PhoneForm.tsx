import { useWizard } from '@/ui/common';
import { localizationKeys } from '@/ui/customizables';
import { withCardStateProvider } from '@/ui/elements/contexts';

import { useAddPhoneController } from './phone-form.controller';
import { usePhoneFormModel } from './phone-form.model';
import type { AddPhoneProps, PhoneFormData, PhoneFormProps, VerifyPhoneProps } from './phone-form.types';
import { AddPhoneView, PhoneFormView, VerifyPhoneView } from './phone-form.view';
import { VerifyWithCode } from './VerifyWithCode';

export const PhoneForm = (props: PhoneFormProps) => {
  const model = usePhoneFormModel(props);
  return (
    <PhoneFormContent
      key={model.requestKey}
      model={model}
      {...props}
    />
  );
};

const PhoneFormContent = withCardStateProvider(({ model, ...props }: PhoneFormProps & { model: PhoneFormData }) => {
  const wizard = useWizard({ defaultStep: model.hasExistingPhone ? 1 : 0 });

  return (
    <PhoneFormView
      wizardProps={wizard.props}
      addPhone={
        <AddPhone
          model={model.addPhone}
          title={localizationKeys('userProfile.phoneNumberPage.title')}
          onSuccess={wizard.nextStep}
          onReset={props.onReset}
        />
      }
      verifyPhone={
        <VerifyPhone
          verification={model.verification}
          title={localizationKeys('userProfile.phoneNumberPage.verifyTitle')}
          onSuccess={props.onSuccess}
          onReset={props.onReset}
        />
      }
    />
  );
});

export const AddPhone = (props: AddPhoneProps) => {
  const controller = useAddPhoneController(props.model, {
    title: props.title,
    onSuccess: props.onSuccess,
    onReset: props.onReset,
    onUseExistingNumberClick: props.onUseExistingNumberClick,
  });

  return <AddPhoneView controller={controller} />;
};

export const VerifyPhone = (props: VerifyPhoneProps) => {
  return (
    <VerifyPhoneView
      title={props.title}
      identifier={props.verification.identifier}
      verification={
        <VerifyWithCode
          nextStep={props.onSuccess}
          {...props.verification}
          onReset={props.onReset}
        />
      }
    />
  );
};
