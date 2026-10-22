import type { ProfileActions } from './profile-actions-types';

export const unavailableProfileActions: ProfileActions = {
  details: {},
  email: {
    available: false,
    canManageEmail: () => false,
    verifier: () => {
      throw new Error('Email unavailable.');
    },
  },
  phone: {
    available: false,
    verifier: () => {
      throw new Error('Phone unavailable.');
    },
  },
  passkey: { available: false },
  wallet: { available: false },
  enterprise: { available: false },
  mfa: { available: false, applicationName: '' },
  connectedAccounts: {
    available: false,
    canManageAccount: () => false,
    canReconnectAccount: () => false,
    canConnectProvider: () => false,
  },
  password: { status: 'unavailable' },
  danger: {},
};
