import { deepCamelToSnake } from '@clerk/shared/utils/object';
import { Poller } from '@clerk/shared/utils/poller';
import type {
  AuthenticateWithRedirectParams,
  CreateMagicLinkFlowReturn,
  PrepareEmailAddressVerificationParams,
  PreparePhoneNumberVerificationParams,
  SignUpCreateParams,
  SignUpField,
  SignUpIdentificationField,
  SignUpJSON,
  SignUpResource,
  SignUpStatus,
  SignUpUpdateParams,
  SignUpVerificationAttemptParams,
  SignUpVerificationStrategy,
  StartMagicLinkFlowParams,
  VerificationAttemptParams,
} from '@clerk/types';
import {
  clerkMissingOptionError,
  clerkVerifyEmailAddressCalledBeforeCreate,
  clerkVerifyWeb3WalletCalledBeforeCreate,
} from 'core/errors';
import {
  GenerateSignatureParams,
  generateSignatureWithMetamask,
  getMetamaskIdentifier,
  windowNavigate,
} from 'utils';
import { normalizeUnsafeMetadata } from 'utils/resourceParams';

import { STRATEGY_WEB3_METAMASK_SIGNATURE } from '../constants';
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

  create = (params: SignUpParams): Promise<SignUpResource> => {
    // TODO Add runtime deprecation warnings if anyone is using the old params:
    // * external_account_strategy
    // * external_account_redirect_url
    // * external_account_action_complete_redirect_url
    return this._basePost({
      path: this.pathRoot,
      body: normalizeUnsafeMetadata(deepCamelToSnake(params)),
    });
  };

  // TODO: Align types, redirect_url should be in object
  prepareVerification = (
    strategy: SignUpVerificationStrategy,
    redirect_url?: string,
  ): Promise<this> => {
    const params = { strategy, ...(redirect_url ? { redirect_url } : {}) };
    return this._basePost({
      body: params,
      action: 'prepare_verification',
    });
  };

  attemptVerification = (
    params: SignUpVerificationAttemptParams,
  ): Promise<SignUpResource> => {
    return this._basePost({
      body: params,
      action: 'attempt_verification',
    });
  };

  prepareEmailAddressVerification = (
    p: PrepareEmailAddressVerificationParams = { strategy: 'email_code' },
  ): Promise<SignUpResource> => {
    const redirectUrl =
      p.strategy === 'email_link' ? p.redirect_url : undefined;
    return this.prepareVerification(p.strategy, redirectUrl);
  };

  attemptEmailAddressVerification = (
    params: VerificationAttemptParams,
  ): Promise<SignUpResource> => {
    return this.attemptVerification({ ...params, strategy: 'email_code' });
  };

  createMagicLinkFlow = (): CreateMagicLinkFlowReturn<
    StartMagicLinkFlowParams,
    SignUpResource
  > => {
    const { run, stop } = Poller();

    const startMagicLinkFlow = async ({
      redirectUrl,
    }: StartMagicLinkFlowParams): Promise<SignUpResource> => {
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
            .then(async res => {
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

  preparePhoneNumberVerification = (
    p: PreparePhoneNumberVerificationParams = { strategy: 'phone_code' },
  ): Promise<SignUpResource> => {
    return this.prepareVerification(p.strategy);
  };

  attemptPhoneNumberVerification = (
    params: VerificationAttemptParams,
  ): Promise<SignUpResource> => {
    return this.attemptVerification({ ...params, strategy: 'phone_code' });
  };

  prepareWeb3WalletVerification = (): Promise<SignUpResource> => {
    return this.prepareVerification(STRATEGY_WEB3_METAMASK_SIGNATURE);
  };

  attemptWeb3WalletVerification = async ({
    generateSignature,
  }: {
    generateSignature: (options: GenerateSignatureParams) => Promise<string>;
  }): Promise<SignUpResource> => {
    if (!(typeof generateSignature === 'function')) {
      clerkMissingOptionError('generateSignature');
    }

    const { nonce } = this.verifications.web3Wallet;
    if (!nonce) {
      clerkVerifyWeb3WalletCalledBeforeCreate('SignUp');
    }

    const signature = await generateSignature({
      identifier: this.web3wallet!,
      nonce,
    });

    return this.attemptVerification({
      signature,
      strategy: STRATEGY_WEB3_METAMASK_SIGNATURE,
    });
  };

  public authenticateWithWeb3 = async ({
    identifier,
    generateSignature,
  }: {
    identifier: string;
    generateSignature: (opts: GenerateSignatureParams) => Promise<string>;
  }): Promise<SignUpResource> => {
    const web3Wallet = identifier || this.web3wallet!;

    await this.create({ web3Wallet });

    await this.prepareWeb3WalletVerification();

    return this.attemptWeb3WalletVerification({
      generateSignature,
    });
  };

  public authenticateWithMetamask = async (): Promise<SignUpResource> => {
    const identifier = await getMetamaskIdentifier();

    return this.authenticateWithWeb3({
      identifier,
      generateSignature: generateSignatureWithMetamask,
    });
  };

  public authenticateWithRedirect = async ({
    strategy,
    redirectUrl,
    redirectUrlComplete,
  }: AuthenticateWithRedirectParams): Promise<void> => {
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

  update = (params: SignUpParams): Promise<SignUpResource> => {
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
