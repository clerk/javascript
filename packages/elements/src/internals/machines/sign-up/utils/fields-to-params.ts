import type { SignUpCreateParams, SignUpUpdateParams } from '@clerk/types';

import type { FormFields } from '~/internals/machines/form/form.types';

export const SignUpAdditionalKeys = [
  'firstName',
  'lastName',
  'emailAddress',
  'username',
  'password',
  'phoneNumber',
] as const;

export type SignUpAdditionalKeys = (typeof SignUpAdditionalKeys)[number];

export const signUpKeys = new Set<SignUpAdditionalKeys>(SignUpAdditionalKeys);

export function isSignUpParam<T extends SignUpAdditionalKeys>(key: string): key is T {
  return signUpKeys.has(key as T);
}

export function fieldsToSignUpParams<T extends SignUpCreateParams | SignUpUpdateParams>(
  fields: FormFields,
): Pick<T, SignUpAdditionalKeys> {
  const params: SignUpUpdateParams = {};

  fields.forEach(({ value }, key) => {
    if (isSignUpParam(key) && value !== undefined) {
      params[key] = value as string;
    }
  });

  return params;
}
