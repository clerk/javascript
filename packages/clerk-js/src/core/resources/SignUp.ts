import { deepCamelToSnake } from '@clerk/shared/utils/object';
import { Poller } from '@clerk/shared/utils/poller';
import type {
  AttemptEmailAddressVerificationParams,
  AttemptPhoneNumberVerificationParams,
  AttemptVerificationParams,
  AttemptWeb3WalletVerificationParams,
  AuthenticateWithRedirectParams,
  AuthenticateWithWeb3Params,
  CreateMagicLinkFlowReturn,
  PrepareEmailAddressVerificationParams,
  PreparePhoneNumberVerificationParams,
  PrepareVerificationParams,
  SignUpCreateParams,
  SignUpField,
  SignUpIdentificationField,
  SignUpJSON,
  SignUpResource,
  SignUpStatus,
  SignUpUpdateParams,
  StartMagicLinkFlowParams,
} from '@clerk/types';
import {
  clerkMissingOptionError,
  clerkVerifyEmailAddressCalledBeforeCreate,
  clerkVerifyWeb3WalletCalledBeforeCreate,
} from 'core/errors';
import { generateSignatureWithMetamask, getMetamaskIdentifier, windowNavigate } from 'utils';
import { normalizeUnsafeMetadata } from 'utils/resourceParams';

import { BaseResource, SignUpVerifications } from './internal';

declare global {
  interface Window {
    ethereum: any;
  }
}

export class SignUp extends BaseResource implements SignUpResource {
  pathRoot = '/client/sign_ups';

  id: string | undefined;
  status: SignUpStatus | null = null;
  requiredFields: SignUpField[] = [];
  optionalFields: SignUpField[] = [];
  missingFields: SignUpField[] = [];
  unverifiedFields: SignUpIdentificationField[] = [];
  verifications: SignUpVerifications = new SignUpVerifications(null);
  username: string | null = null;
  firstName: string | null = null;
  lastName: string | null = null;
  emailAddress: string | null = null;
  phoneNumber: string | null = null;
  web3wallet: string | null = null;
  externalAccount: any;
  hasPassword = false;
  unsafeMetadata: Record<string, unknown> = {};
  createdSessionId: string | null = null;
  abandonAt: number | null = null;

  constructor(data: SignUpJSON | null = null) {
    super();
    this.fromJSON(data);
  }

  create = (params: SignUpCreateParams): Promise<SignUpResource> => {
    return this._basePost({
      path: this.pathRoot,
      body: normalizeUnsafeMetadata(deepCamelToSnake(params)),
    });
  };

  prepareVerification = (params: PrepareVerificationParams): Promise<this> => {
    return this._basePost({
      body: params,
      action: 'prepare_verification',
    });
  };

  attemptVerification = (params: AttemptVerificationParams): Promise<SignUpResource> => {
    return this._basePost({
      body: params,
      action: 'attempt_verification',
    });
  };

  prepareEmailAddressVerification = (params?: PrepareEmailAddressVerificationParams): Promise<SignUpResource> => {
    return this.prepareVerification(params || { strategy: 'email_code' });
  };

  attemptEmailAddressVerification = (params: AttemptEmailAddressVerificationParams): Promise<SignUpResource> => {
    return this.attemptVerification({ ...params, strategy: 'email_code' });
  };

  createMagicLinkFlow = (): CreateMagicLinkFlowReturn<StartMagicLinkFlowParams, SignUpResource> => {
    const { run, stop } = Poller();

    const startMagicLinkFlow = async ({ redirectUrl }: StartMagicLinkFlowParams): Promise<SignUpResource> => {
      if (!this.id) {
        clerkVerifyEmailAddressCalledBeforeCreate('SignUp');
      }
      await this.prepareEmailAddressVerification({
        strategy: 'email_link',
        redirect_url: redirectUrl,
      });

      return new Promise((resolve, reject) => {
        void run(() => {
          return this._baseGet({ forceUpdateClient: true })
            .then(res => {
              const status = res.verifications.emailAddress.status;
              if (status === 'verified' || status === 'expired') {
                stop();
                resolve(res);
              }
            })
            .catch(err => {
              stop();
              reject(err);
            });
        });
      });
    };

    return { startMagicLinkFlow, cancelMagicLinkFlow: stop };
  };

  preparePhoneNumberVerification = (params?: PreparePhoneNumberVerificationParams): Promise<SignUpResource> => {
    return this.prepareVerification(params || { strategy: 'phone_code' });
  };

  attemptPhoneNumberVerification = (params: AttemptPhoneNumberVerificationParams): Promise<SignUpResource> => {
    return this.attemptVerification({ ...params, strategy: 'phone_code' });
  };

  prepareWeb3WalletVerification = (): Promise<SignUpResource> => {
    return this.prepareVerification({ strategy: 'web3_metamask_signature' });
  };

  attemptWeb3WalletVerification = async (params: AttemptWeb3WalletVerificationParams): Promise<SignUpResource> => {
    const { generateSignature } = params || {};
    if (!(typeof generateSignature === 'function')) {
      clerkMissingOptionError('generateSignature');
    }

    const { nonce } = this.verifications.web3Wallet;
    if (!nonce) {
      clerkVerifyWeb3WalletCalledBeforeCreate('SignUp');
    }

    const signature = await generateSignature({ identifier: this.web3wallet!, nonce });
    return this.attemptVerification({ signature, strategy: 'web3_metamask_signature' });
  };

  public authenticateWithWeb3 = async (params: AuthenticateWithWeb3Params): Promise<SignUpResource> => {
    const { generateSignature, identifier } = params || {};
    const web3Wallet = identifier || this.web3wallet!;
    await this.create({ web3Wallet });
    await this.prepareWeb3WalletVerification();
    return this.attemptWeb3WalletVerification({ generateSignature });
  };

  public authenticateWithMetamask = async (): Promise<SignUpResource> => {
    const identifier = await getMetamaskIdentifier();
    return this.authenticateWithWeb3({ identifier, generateSignature: generateSignatureWithMetamask });
  };

  public authenticateWithRedirect = async (params: AuthenticateWithRedirectParams): Promise<void> => {
    const { redirectUrl, redirectUrlComplete, strategy } = params || {};
    const { verifications } = await this.create({
      strategy,
      redirect_url: redirectUrl,
      action_complete_redirect_url: redirectUrlComplete,
    });
    const { externalAccount } = verifications;
    const { status, externalVerificationRedirectURL } = externalAccount;

    if (status === 'unverified' && !!externalVerificationRedirectURL) {
      windowNavigate(externalVerificationRedirectURL);
    } else {
      // TODO:
      const email = SignUp.fapiClient.buildEmailAddress('support');
      const message = `Response: ${status} not supported yet.\nFor more information contact us at ${email}`;
      alert(message);
    }
  };

  update = (params: SignUpUpdateParams): Promise<SignUpResource> => {
    return this._basePatch({
      body: normalizeUnsafeMetadata(deepCamelToSnake(params)),
    });
  };

  protected fromJSON(data: SignUpJSON | null): this {
    if (data) {
      this.id = data.id;
      this.status = data.status;
      this.requiredFields = data.required_fields;
      this.optionalFields = data.optional_fields;
      this.missingFields = data.missing_fields;
      this.unverifiedFields = data.unverified_fields;
      this.verifications = new SignUpVerifications(data.verifications);
      this.username = data.username;
      this.firstName = data.first_name;
      this.lastName = data.last_name;
      this.emailAddress = data.email_address;
      this.phoneNumber = data.phone_number;
      this.hasPassword = data.has_password;
      this.unsafeMetadata = data.unsafe_metadata;
      this.createdSessionId = data.created_session_id;
      this.abandonAt = data.abandon_at;
      this.web3wallet = data.web3_wallet;
    }
    return this;
  }
}
