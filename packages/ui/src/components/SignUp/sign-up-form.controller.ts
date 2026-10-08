import type { useSignUpFormModel } from './sign-up-form.model';
import type { SignUpFormProps } from './SignUpForm';

export const useSignUpFormController = (model: ReturnType<typeof useSignUpFormModel>, props: SignUpFormProps) => {
  const { fields, canToggleEmailPhone, handleEmailPhoneToggle } = props;

  const shouldShow = (name: keyof typeof fields) => {
    // In case both email & phone are optional, then don't take into account the
    // Options showOptionalFields prop and the required field.
    if ((name === 'emailAddress' || name === 'phoneNumber') && canToggleEmailPhone) {
      return !!fields[name];
    }

    return !!fields[name] && (model.showOptionalFields || fields[name]?.required);
  };

  return {
    ...props,
    onlyLegalAcceptedMissing: props.onlyLegalAcceptedMissing ?? false,
    visible: {
      firstName: shouldShow('firstName'),
      lastName: shouldShow('lastName'),
      username: shouldShow('username'),
      emailAddress: shouldShow('emailAddress'),
      phoneNumber: shouldShow('phoneNumber'),
      password: shouldShow('password'),
      legalAccepted: shouldShow('legalAccepted'),
    },
    onUsePhone: () => handleEmailPhoneToggle('phoneNumber'),
    onUseEmail: () => handleEmailPhoneToggle('emailAddress'),
  };
};
