import type { PasswordSettingsData, PasswordValidation, Web3Strategy } from '@clerk/shared/types';

import type { UserNameInput } from './types';

export type ProfileActionOptions = {
  navigate?: (url: string) => Promise<unknown>;
  mode?: 'modal' | 'navigation';
  additionalOAuthScopes?: Partial<Record<string, string[]>>;
  reverifyReconnect?: (create: () => Promise<void>) => Promise<void>;
};

export type ProfileEmailVerification =
  | { method: 'code'; sent: Promise<unknown> }
  | { method: 'link'; verified: Promise<unknown>; cancel: () => void }
  | { method: 'sso'; connect: () => Promise<void> };

export type ProfileEmailVerifier = {
  start: () => ProfileEmailVerification;
  verifyCode: (code: string) => Promise<void>;
};

export type ProfilePhoneVerifier = {
  sendCode: () => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
};

export type ProfileActions = {
  details: {
    usernameLength?: { min: number; max: number };
    updateName?: (input: UserNameInput) => Promise<void>;
    updateUsername?: (username: string) => Promise<void>;
    setProfileImage?: (file: File) => Promise<void>;
    removeProfileImage?: () => Promise<void>;
  };
  email: {
    available: boolean;
    canManageEmail: (id: string) => boolean;
    create?: (address: string) => Promise<ProfileEmailVerifier>;
    verifier: (id: string) => ProfileEmailVerifier;
    setPrimary?: (id: string) => Promise<void>;
    remove?: (id: string) => Promise<void>;
  };
  phone: {
    available: boolean;
    defaultCountry?: string;
    create?: (number: string) => Promise<ProfilePhoneVerifier>;
    verifier: (id: string) => ProfilePhoneVerifier;
    setPrimary?: (id: string) => Promise<void>;
    remove?: (id: string) => Promise<void>;
  };
  passkey: {
    available: boolean;
    add?: () => Promise<void>;
    rename?: (id: string, name: string) => Promise<void>;
    remove?: (id: string) => Promise<void>;
  };
  wallet: {
    available: boolean;
    connect?: (strategy: Web3Strategy, walletName?: string) => Promise<void>;
    setPrimary?: (id: string) => Promise<void>;
    remove?: (id: string) => Promise<void>;
  };
  enterprise: {
    available: boolean;
    connect?: (connectionId: string) => Promise<'redirecting'>;
  };
  mfa: {
    available: boolean;
    applicationName: string;
    findOrCreatePhone?: (number: string) => Promise<{ id: string; phoneNumber: string; verified: boolean }>;
    enrollSms?: (
      id: string,
      code?: string,
    ) => Promise<
      | { status: 'needsVerification'; phone: { id: string; phoneNumber: string; verified: boolean } }
      | { status: 'complete'; backupCodes: readonly string[] }
    >;
    resendSms?: (id: string) => Promise<void>;
    setDefault?: (id: string) => Promise<void>;
    createAuthenticator?: () => Promise<{ secret: string; uri: string }>;
    verifyAuthenticator?: (code: string) => Promise<{ backupCodes: readonly string[] }>;
    generateBackupCodes?: () => Promise<readonly string[]>;
    remove?: (id: string) => Promise<void>;
  };
  connectedAccounts: {
    available: boolean;
    canManageAccount: (id: string) => boolean;
    canReconnectAccount: (id: string) => boolean;
    canConnectProvider: (id: string) => boolean;
    connect?: (id: string) => Promise<void | 'redirecting'>;
    reconnect?: (id: string) => Promise<void | 'redirecting'>;
    remove?: (id: string) => Promise<void>;
  };
  password:
    | { status: 'unavailable' }
    | {
        status: 'ready';
        mode: 'set' | 'change';
        requiresCurrentPassword: boolean;
        userId: string;
        sessionId: string;
        identifier: string;
        settings: PasswordSettingsData;
        validate: (password: string) => Promise<PasswordValidation>;
        update: (input: {
          currentPassword?: string;
          newPassword: string;
          signOutOfOtherSessions: boolean;
        }) => Promise<void>;
      };
  danger: { delete?: () => Promise<void> };
};
