import type { HTMLInputTypeAttribute } from 'react';

/** Extracted relevant fields from @clerk/types  */
export type ClerkFieldId =
  | 'code'
  | 'confirmPassword'
  | 'currentPassword'
  | 'emailAddress'
  | 'firstName'
  | 'identifier'
  | 'lastName'
  | 'name'
  | 'newPassword'
  | 'password'
  | 'phoneNumber'
  | 'username';

/**
 * Possible types for the Clerk input element, several 'special' input types are included.
 */
export type ClerkInputType = HTMLInputTypeAttribute | 'otp';

export const FIELD_STATES = {
  valid: 'valid',
  invalid: 'invalid',
  idle: 'idle',
  warn: 'warn',
} as const;

export type FieldStates = (typeof FIELD_STATES)[keyof typeof FIELD_STATES];
