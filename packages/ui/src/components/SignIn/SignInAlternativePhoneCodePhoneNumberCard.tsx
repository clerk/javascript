import type { PhoneCodeChannelData } from '@clerk/shared/types';

import type { FormControlState } from '@/ui/utils/useFormControl';

import { useAlternativePhoneCodeCardModel } from './alternative-phone-code-card.model';
import { AlternativePhoneCodeCardView } from './alternative-phone-code-card.view';

export type SignInAlternativePhoneCodePhoneNumberCardProps = {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<unknown>;
  phoneNumberFormState: FormControlState<any>;
  onUseAnotherMethod: () => void;
  phoneCodeProvider: PhoneCodeChannelData;
  error?: string;
};

export const SignInAlternativePhoneCodePhoneNumberCard = (props: SignInAlternativePhoneCodePhoneNumberCardProps) => {
  const model = useAlternativePhoneCodeCardModel(props.phoneCodeProvider);
  return (
    <AlternativePhoneCodeCardView
      {...model}
      {...props}
    />
  );
};
