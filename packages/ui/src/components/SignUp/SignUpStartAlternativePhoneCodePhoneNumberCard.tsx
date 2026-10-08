import type { PhoneCodeChannelData } from '@clerk/shared/types';
import type React from 'react';

import type { FormControlState } from '@/ui/utils/useFormControl';

import { useSignUpStartAlternativePhoneCodePhoneNumberCardModel } from './sign-up-start-alternative-phone-code-phone-number-card.model';
import { SignUpStartAlternativePhoneCodePhoneNumberCardView } from './sign-up-start-alternative-phone-code-phone-number-card.view';
import type { Fields } from './signUpFormHelpers';

export type SignUpStartAlternativePhoneCodePhoneNumberCardProps = {
  handleSubmit: React.FormEventHandler;
  fields: Fields;
  formState: Record<Exclude<keyof Fields, 'ticket'>, FormControlState<any>>;
  onUseAnotherMethod: () => void;
  phoneCodeProvider: PhoneCodeChannelData;
  error?: string;
};

export const SignUpStartAlternativePhoneCodePhoneNumberCard = (
  props: SignUpStartAlternativePhoneCodePhoneNumberCardProps,
) => {
  const model = useSignUpStartAlternativePhoneCodePhoneNumberCardModel(props.phoneCodeProvider);
  return (
    <SignUpStartAlternativePhoneCodePhoneNumberCardView
      {...model}
      {...props}
    />
  );
};
