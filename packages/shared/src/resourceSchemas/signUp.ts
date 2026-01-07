import type { SignUpFields } from '../types/state';
import type { ResourceSchema } from './types';

/**
 * Schema for the SignUp resource.
 * Tied to clerk.client.signUp lifecycle (client-based).
 */
export const signUpSchema: ResourceSchema<SignUpFields> = {
  name: 'signUp',
  resourceType: 'client-based',
  errorFields: {
    firstName: null,
    lastName: null,
    emailAddress: null,
    phoneNumber: null,
    password: null,
    username: null,
    code: null,
    captcha: null,
    legalAccepted: null,
  },
  properties: {
    id: { default: undefined },
    status: { default: 'missing_requirements' },
    requiredFields: { default: [] },
    optionalFields: { default: [] },
    missingFields: { default: [] },
    unverifiedFields: { default: [] },
    username: { default: null },
    firstName: { default: null },
    lastName: { default: null },
    emailAddress: { default: null },
    phoneNumber: { default: null },
    web3Wallet: { default: null },
    hasPassword: { default: false },
    unsafeMetadata: { default: {} },
    createdSessionId: { default: null },
    createdUserId: { default: null },
    abandonAt: { default: null },
    legalAcceptedAt: { default: null },
    locale: { default: null },
    isTransferable: { default: false },
    hasBeenFinalized: { default: false },
  },
  methods: ['create', 'update', 'sso', 'password', 'ticket', 'web3', 'finalize'],
  nestedMethods: {
    verifications: ['sendEmailCode', 'verifyEmailCode', 'sendPhoneCode', 'verifyPhoneCode'],
  },
};
