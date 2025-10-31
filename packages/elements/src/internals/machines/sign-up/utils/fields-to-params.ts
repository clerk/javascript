import type { SignUpCreateParams, SignUpUpdateParams } from '@clerk/shared/types';

import type { FormFields } from '~/internals/machines/form';

const SignUpAdditionalKeys = [
  'firstName',
  'lastName',
  'emailAddress',
  'username',
  'password',
  'phoneNumber',
  'legalAccepted',
] as const;

type SignUpAdditionalKeys = (typeof SignUpAdditionalKeys)[number];

const signUpKeys = new Set<SignUpAdditionalKeys>(SignUpAdditionalKeys);

function isSignUpParam<T extends SignUpAdditionalKeys>(key: string): key is T {
  return signUpKeys.has(key as T);
}

export function fieldsToSignUpParams<T extends SignUpCreateParams | SignUpUpdateParams>(
  fields: FormFields,
): Pick<T, SignUpAdditionalKeys> {
  const params: SignUpUpdateParams = {};

  fields.forEach(({ value, checked, type }, key) => {
    if (isSignUpParam(key) && value !== undefined && type !== 'checkbox') {
      // @ts-expect-error - Type is not narrowed to string
      params[key] = value as string;
    }

    if (isSignUpParam(key) && checked !== undefined && type === 'checkbox') {
      // @ts-expect-error - Type is not narrowed to boolean
      params[key] = checked;
    }
  });

  return params;
}
