import type { Autocomplete } from '@clerk/shared/types';
import type { FormFieldProps as RadixFormFieldProps } from '@radix-ui/react-form';

import type { ClerkFieldId, FieldStates } from '../types';

// TODO: Move this to a shared location
type FormFieldProps = Omit<RadixFormFieldProps, 'children'> & {
  name: Autocomplete<ClerkFieldId>;
  alwaysShow?: boolean;
  children: React.ReactNode | ((state: FieldStates) => React.ReactNode);
};

export function determineInputTypeFromName(name: FormFieldProps['name']) {
  if (name === 'password' || name === 'confirmPassword' || name === 'currentPassword' || name === 'newPassword') {
    return 'password' as const;
  }
  if (name === 'emailAddress') {
    return 'email' as const;
  }
  if (name === 'phoneNumber') {
    return 'tel' as const;
  }
  if (name === 'code') {
    return 'otp' as const;
  }
  if (name === 'backup_code') {
    return 'backup_code' as const;
  }

  return 'text' as const;
}
