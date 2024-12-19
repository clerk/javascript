import type { HTMLInputTypeAttribute } from 'react';

import type { ClerkElementsError } from '~/internals/errors';

/** Extracted relevant fields from @clerk/types  */
export type ClerkFieldId =
  | 'code'
  | 'confirmPassword'
  | 'currentPassword'
  | 'backup_code' // special case of `code`
  | 'emailAddress'
  | 'firstName'
  | 'identifier'
  | 'lastName'
  | 'name'
  | 'newPassword'
  | 'password'
  | 'phoneNumber'
  | 'username'
  | 'legalAccepted';

/**
 * Possible types for the Clerk input element, several 'special' input types are included.
 */
export type ClerkInputType = HTMLInputTypeAttribute | 'otp';

export const FIELD_STATES = {
  success: 'success',
  error: 'error',
  idle: 'idle',
  warning: 'warning',
  info: 'info',
} as const;

export type FieldStates = (typeof FIELD_STATES)[keyof typeof FIELD_STATES];

export const FIELD_VALIDITY = {
  valid: 'valid',
  invalid: 'invalid',
} as const;

export type FieldValidity = (typeof FIELD_VALIDITY)[keyof typeof FIELD_VALIDITY];

export type FormErrorRenderProps = Pick<ClerkElementsError, 'code' | 'message'>;

type FormErrorPropsAsChild = {
  asChild?: true | never;
  children?: React.ReactElement | ((error: FormErrorRenderProps) => React.ReactNode);
  code?: string;
};

type FormErrorPropsStd = {
  asChild?: false;
  children: React.ReactNode;
  code: string;
};

export type FormErrorProps<T> = Omit<T, 'asChild' | 'children'> & (FormErrorPropsStd | FormErrorPropsAsChild);
