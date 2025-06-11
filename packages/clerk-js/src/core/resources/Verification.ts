import { errorToJSON, parseError } from '@clerk/shared/error';
import type {
  ClerkAPIErrorJSON,
  PasskeyVerificationResource,
  PhoneCodeChannel,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialCreationOptionsWithoutExtensions,
  SignUpVerificationJSON,
  SignUpVerificationJSONSnapshot,
  SignUpVerificationResource,
  SignUpVerificationsJSON,
  SignUpVerificationsJSONSnapshot,
  SignUpVerificationsResource,
  VerificationJSON,
  VerificationJSONSnapshot,
  VerificationResource,
  VerificationStatus,
} from '@clerk/types';
import { devtools } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

import { unixEpochToDate } from '../../utils/date';
import { convertJSONToPublicKeyCreateOptions } from '../../utils/passkeys';
import { BaseResource } from './internal';
import { createResourceSlice, type ResourceStore } from './state';

/**
 * Verification slice state type
 */
type VerificationSliceState = {
  verification: {
    error: ClerkAPIErrorJSON | null;
    setError: (error: ClerkAPIErrorJSON | null) => void;
    clearError: () => void;
    hasError: () => boolean;
  };
};

/**
 * Creates a verification slice following the Zustand slices pattern.
 * This slice handles verification-specific state management.
 * All verification state is namespaced under the 'verification' key.
 */
const createVerificationSlice = (set: any, get: any): VerificationSliceState => ({
  verification: {
    error: null,
    setError: (error: ClerkAPIErrorJSON | null) => {
      set((state: any) => ({
        ...state,
        verification: {
          ...state.verification,
          error: error,
        },
      }));
    },
    clearError: () => {
      set((state: any) => ({
        ...state,
        verification: {
          ...state.verification,
          error: null,
        },
      }));
    },
    hasError: () => {
      const state = get();
      return state.verification.error !== null;
    },
  },
});

type CombinedVerificationStore = ResourceStore<Verification> & VerificationSliceState;

export class Verification extends BaseResource implements VerificationResource {
  pathRoot = '';

  attempts: number | null = null;
  channel?: PhoneCodeChannel;
  expireAt: Date | null = null;
  externalVerificationRedirectURL: URL | null = null;
  message: string | null = null;
  nonce: string | null = null;
  status: VerificationStatus | null = null;
  strategy: string | null = null;
  verifiedAtClient: string | null = null;

  constructor(data: VerificationJSON | VerificationJSONSnapshot | null) {
    super();
    // Override the base _store with our combined store using slices pattern with namespacing
    this._store = createStore<CombinedVerificationStore>()(
      devtools(
        (set, get) => ({
          ...createResourceSlice<Verification>(set, get),
          ...createVerificationSlice(set, get),
        }),
        { name: 'VerificationStore' },
      ),
    ) as any;
    this.fromJSON(data);
  }

  /**
   * Reactive error property backed by the store.
   * Reading goes directly from the store.
   */
  get error(): ClerkAPIErrorJSON | null {
    return (this._store.getState() as CombinedVerificationStore).verification.error;
  }

  verifiedFromTheSameClient = (): boolean => {
    return this.verifiedAtClient === BaseResource.clerk?.client?.id;
  };

  protected fromJSON(data: VerificationJSON | VerificationJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.status = data.status;
    this.verifiedAtClient = data.verified_at_client;
    this.strategy = data.strategy;
    this.nonce = data.nonce || null;
    this.message = data.message || null;
    if (data.external_verification_redirect_url) {
      this.externalVerificationRedirectURL = new URL(data.external_verification_redirect_url);
    } else {
      this.externalVerificationRedirectURL = null;
    }
    this.attempts = data.attempts;
    this.expireAt = unixEpochToDate(data.expire_at || undefined);

    // Set error state directly in the verification slice
    if (data.error) {
      const parsedError = errorToJSON(parseError(data.error));
      (this._store.getState() as CombinedVerificationStore).verification.setError(parsedError);
    } else {
      (this._store.getState() as CombinedVerificationStore).verification.clearError();
    }

    this.channel = data.channel || undefined;

    return this;
  }

  public __internal_toSnapshot(): VerificationJSONSnapshot {
    return {
      object: 'verification',
      id: this.id || '',
      status: this.status,
      strategy: this.strategy,
      nonce: this.nonce,
      message: this.message,
      external_verification_redirect_url: this.externalVerificationRedirectURL?.toString() || null,
      attempts: this.attempts,
      expire_at: this.expireAt?.getTime() || null,
      error: this.error || { code: '', message: '' },
      verified_at_client: this.verifiedAtClient,
    };
  }
}

export class PasskeyVerification extends Verification implements PasskeyVerificationResource {
  publicKey: PublicKeyCredentialCreationOptionsWithoutExtensions | null = null;

  constructor(data: VerificationJSON | VerificationJSONSnapshot | null) {
    super(data);
  }

  /**
   * Transform base64url encoded strings to ArrayBuffer
   */
  protected fromJSON(data: VerificationJSON | VerificationJSONSnapshot | null): this {
    super.fromJSON(data);
    if (!data?.nonce) {
      this.publicKey = null;
    } else {
      this.publicKey = convertJSONToPublicKeyCreateOptions(
        JSON.parse(data.nonce) as PublicKeyCredentialCreationOptionsJSON,
      );
    }

    return this;
  }
}

export class SignUpVerifications implements SignUpVerificationsResource {
  emailAddress: SignUpVerificationResource;
  phoneNumber: SignUpVerificationResource;
  web3Wallet: SignUpVerificationResource;
  externalAccount: VerificationResource;

  constructor(data: SignUpVerificationsJSON | SignUpVerificationsJSONSnapshot | null) {
    this.emailAddress = new SignUpVerification(data?.email_address ?? null);
    this.phoneNumber = new SignUpVerification(data?.phone_number ?? null);
    this.web3Wallet = new SignUpVerification(data?.web3_wallet ?? null);
    this.externalAccount = new Verification(data?.external_account ?? null);
  }

  public __internal_toSnapshot(): SignUpVerificationsJSONSnapshot {
    return {
      email_address: this.emailAddress.__internal_toSnapshot(),
      phone_number: this.phoneNumber.__internal_toSnapshot(),
      web3_wallet: this.web3Wallet.__internal_toSnapshot(),
      external_account: this.externalAccount.__internal_toSnapshot(),
    };
  }
}

export class SignUpVerification extends Verification {
  nextAction: string;
  supportedStrategies: string[];

  constructor(data: SignUpVerificationJSON | SignUpVerificationJSONSnapshot | null) {
    super(data);
    this.nextAction = data?.next_action ?? '';
    this.supportedStrategies = data?.supported_strategies ?? [];
  }

  public __internal_toSnapshot(): SignUpVerificationJSONSnapshot {
    return {
      ...super.__internal_toSnapshot(),
      next_action: this.nextAction,
      supported_strategies: this.supportedStrategies,
    };
  }
}
