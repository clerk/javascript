import type React from 'react';

import type { FormControlState } from '@/ui/utils/useFormControl';

import { useSignUpFormController } from './sign-up-form.controller';
import { useSignUpFormModel } from './sign-up-form.model';
import { SignUpFormView } from './sign-up-form.view';
import type { ActiveIdentifier, Fields } from './signUpFormHelpers';

export type SignUpFormProps = {
  handleSubmit: React.FormEventHandler;
  fields: Fields;
  formState: Record<Exclude<keyof Fields, 'ticket'>, FormControlState<any>>;
  canToggleEmailPhone: boolean;
  handleEmailPhoneToggle: (type: ActiveIdentifier) => void;
  onlyLegalAcceptedMissing?: boolean;
};

export const SignUpForm = (props: SignUpFormProps) => {
  const model = useSignUpFormModel();
  const controller = useSignUpFormController(model, props);

  return <SignUpFormView {...controller} />;
};
