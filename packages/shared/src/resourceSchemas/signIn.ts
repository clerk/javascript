import type { SignInFields } from '../types/state';
import type { ResourceSchema } from './types';

/**
 * Schema for the SignIn resource.
 * Tied to clerk.client.signIn lifecycle (client-based).
 */
export const signInSchema: ResourceSchema<SignInFields> = {
  name: 'signIn',
  resourceType: 'client-based',
  errorFields: {
    identifier: null,
    password: null,
    code: null,
  },
  properties: {
    id: { default: undefined },
    status: { default: 'needs_identifier' },
    identifier: { default: null },
    createdSessionId: { default: null },
    isTransferable: { default: false },
    hasBeenFinalized: { default: false },
    supportedFirstFactors: { default: [] },
    supportedSecondFactors: { default: [] },
    userData: { default: {} },
    firstFactorVerification: { default: null },
    secondFactorVerification: { default: null },
  },
  methods: ['create', 'password', 'sso', 'finalize', 'ticket', 'passkey', 'web3'],
  nestedMethods: {
    emailCode: ['sendCode', 'verifyCode'],
    emailLink: ['sendLink', 'waitForVerification'],
    phoneCode: ['sendCode', 'verifyCode'],
    resetPasswordEmailCode: ['sendCode', 'verifyCode', 'submitPassword'],
    mfa: ['sendPhoneCode', 'verifyPhoneCode', 'verifyTOTP', 'verifyBackupCode'],
  },
};
