import type { HTMLInputTypeAttribute } from 'react';

/**
 * Possible types for the Clerk input element, several 'special' input types are included.
 */
export type ClerkInputType = HTMLInputTypeAttribute | 'otp';

export type FieldState = 'valid' | 'invalid';
