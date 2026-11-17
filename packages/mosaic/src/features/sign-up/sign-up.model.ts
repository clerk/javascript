import type { SignUpNextStep } from '@clerk/shared/internal/clerk-js/nextStep';

import type { SignUpFields, SignUpLegalConsent } from './sign-up.types';

export interface SignUpDetailsValues {
  emailAddress?: string;
  phoneNumber?: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  legalAccepted?: boolean;
}

export interface SignUpData {
  step: SignUpNextStep;
  mode: 'public' | 'restricted' | 'waitlist';
  startFields: SignUpFields;
  missingFields: SignUpFields;
  emailAddress: string | null;
  phoneNumber: string | null;
  legalConsent?: SignUpLegalConsent;
  applicationName: string;
  applicationLogoUrl?: string;
}

export interface SignUpCallbacks {
  create: (values: SignUpDetailsValues) => Promise<SignUpNextStep>;
  update: (values: SignUpDetailsValues) => Promise<SignUpNextStep>;
  sendEmailCode: () => Promise<void>;
  verifyEmailCode: (code: string) => Promise<SignUpNextStep>;
  sendPhoneCode: () => Promise<void>;
  verifyPhoneCode: (code: string) => Promise<SignUpNextStep>;
  finalize: () => Promise<void>;
  reset: () => Promise<void>;
}

export type SignUpModel = { status: 'loading' } | (SignUpData & SignUpCallbacks & { status: 'ready' });
