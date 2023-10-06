import { deepSnakeToCamel, deprecated, Poller } from '@clerk/shared';
import type {
  AttemptFirstFactorParams,
  AttemptSecondFactorParams,
  AuthenticateWithRedirectParams,
  AuthenticateWithWeb3Params,
  CreateEmailLinkFlowReturn,
  CreateMagicLinkFlowReturn,
  EmailCodeConfig,
  EmailLinkConfig,
  PhoneCodeConfig,
  PrepareFirstFactorParams,
  PrepareSecondFactorParams,
  ResetPasswordEmailCodeFactorConfig,
  ResetPasswordParams,
  ResetPasswordPhoneCodeFactorConfig,
  SamlConfig,
  SignInCreateParams,
  SignInFirstFactor,
  SignInIdentifier,
  SignInJSON,
  SignInResource,
  SignInSecondFactor,
  SignInStartEmailLinkFlowParams,
  SignInStartMagicLinkFlowParams,
  SignInStatus,
  VerificationResource,
  Web3SignatureConfig,
  Web3SignatureFactor,
} from '@clerk/types';

import { generateSignatureWithMetamask, getMetamaskIdentifier, windowNavigate } from '../../utils';
import { createValidatePassword } from '../../utils/passwords/password';
import {
  clerkInvalidFAPIResponse,
  clerkInvalidStrategy,
  clerkMissingOptionError,
  clerkVerifyEmailAddressCalledBeforeCreate,
  clerkVerifyWeb3WalletCalledBeforeCreate,
} from '../errors';
import { BaseResource, UserData, Verification } from './internal';

export class SignIn extends BaseResource implements SignInResource {
  pathRoot = '/client/sign_ins';

  id?: string;
  status: SignInStatus | null = null;
  supportedIdentifiers: SignInIdentifier[] = [];
  supportedFirstFactors: SignInFirstFactor[] = [];
  supportedSecondFactors: SignInSecondFactor[] = [];
  firstFactorVerification: VerificationResource = new Verification(null);
  secondFactorVerification: VerificationResource = new Verification(null);
  identifier: string | null = null;
  createdSessionId: string | null = null;
  userData!: UserData;

  constructor(data: SignInJSON | null = null) {
    super();
    this.fromJSON(data);
  }

  create = (params: SignInCreateParams): Promise<this> => {
    return this._basePost({
      path: this.pathRoot,
      body: params,
    });
  };

  resetPassword = (params: ResetPasswordParams): Promise<SignInResource> => {
    return this._basePost({
      body: params,
      action: 'reset_password',
    });
  };

  prepareFirstFactor = (factor: PrepareFirstFactorParams): Promise<SignInResource> => {
    let config;
    switch (factor.strategy) {
      case 'email_link':
        config = {
          emailAddressId: factor.emailAddressId,
          redirectUrl: factor.redirectUrl,
        } as EmailLinkConfig;
        break;
      case 'email_code':
        config = { emailAddressId: factor.emailAddressId } as EmailCodeConfig;
        break;
      case 'phone_code':
        config = {
          phoneNumberId: factor.phoneNumberId,
          default: factor.default,
        } as PhoneCodeConfig;
        break;
      case 'web3_metamask_signature':
        config = { web3WalletId: factor.web3WalletId } as Web3SignatureConfig;
        break;
      case 'reset_password_phone_code':
        config = { phoneNumberId: factor.phoneNumberId } as ResetPasswordPhoneCodeFactorConfig;
        break;
      case 'reset_password_email_code':
        config = { emailAddressId: factor.emailAddressId } as ResetPasswordEmailCodeFactorConfig;
        break;
      case 'saml':
        config = {
          redirectUrl: factor.redirectUrl,
          actionCompleteRedirectUrl: factor.actionCompleteRedirectUrl,
        } as SamlConfig;
        break;
      default:
        clerkInvalidStrategy('SignIn.prepareFirstFactor', factor.strategy);
    }
    return this._basePost({
      body: { ...config, strategy: factor.strategy },
      action: 'prepare_first_factor',
    });
  };

  attemptFirstFactor = (params: AttemptFirstFactorParams): Promise<SignInResource> => {
    return this._basePost({
      body: params,
      action: 'attempt_first_factor',
    });
  };
  /**
   * @deprecated Use `createEmailLinkFlow` instead.
   */
  createMagicLinkFlow = (): CreateMagicLinkFlowReturn<SignInStartMagicLinkFlowParams, SignInResource> => {
    deprecated('createMagicLinkFlow', 'Use `createEmailLinkFlow` instead.');

    const { run, stop } = Poller();

    const startMagicLinkFlow = async ({
      emailAddressId,
      redirectUrl,
    }: SignInStartMagicLinkFlowParams): Promise<SignInResource> => {
      if (!this.id) {
        clerkVerifyEmailAddressCalledBeforeCreate('SignIn');
      }
      await this.prepareFirstFactor({
        strategy: 'email_link',
        emailAddressId: emailAddressId,
        redirectUrl: redirectUrl,
      });
      return new Promise((resolve, reject) => {
        void run(() => {
          return this.reload()
            .then(res => {
              const status = res.firstFactorVerification.status;
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

  createEmailLinkFlow = (): CreateEmailLinkFlowReturn<SignInStartEmailLinkFlowParams, SignInResource> => {
    const { run, stop } = Poller();

    const startEmailLinkFlow = async ({
      emailAddressId,
      redirectUrl,
    }: SignInStartEmailLinkFlowParams): Promise<SignInResource> => {
      if (!this.id) {
        clerkVerifyEmailAddressCalledBeforeCreate('SignIn');
      }
      await this.prepareFirstFactor({
        strategy: 'email_link',
        emailAddressId: emailAddressId,
        redirectUrl: redirectUrl,
      });
      return new Promise((resolve, reject) => {
        void run(() => {
          return this.reload()
            .then(res => {
              const status = res.firstFactorVerification.status;
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

    return { startEmailLinkFlow, cancelEmailLinkFlow: stop };
  };

  prepareSecondFactor = (params: PrepareSecondFactorParams): Promise<SignInResource> => {
    return this._basePost({
      body: params,
      action: 'prepare_second_factor',
    });
  };

  attemptSecondFactor = (params: AttemptSecondFactorParams): Promise<SignInResource> => {
    return this._basePost({
      body: params,
      action: 'attempt_second_factor',
    });
  };

  public authenticateWithRedirect = async (params: AuthenticateWithRedirectParams): Promise<void> => {
    const { strategy, redirectUrl, redirectUrlComplete, identifier } = params || {};

    const { firstFactorVerification } =
      strategy === 'saml' && this.id
        ? await this.prepareFirstFactor({
            strategy,
            redirectUrl: SignIn.clerk.buildUrlWithAuth(redirectUrl),
            actionCompleteRedirectUrl: redirectUrlComplete,
          })
        : await this.create({
            strategy,
            identifier,
            redirectUrl: SignIn.clerk.buildUrlWithAuth(redirectUrl),
            actionCompleteRedirectUrl: redirectUrlComplete,
          });

    const { status, externalVerificationRedirectURL } = firstFactorVerification;

    if (status === 'unverified' && externalVerificationRedirectURL) {
      windowNavigate(externalVerificationRedirectURL);
    } else {
      clerkInvalidFAPIResponse(status, SignIn.fapiClient.buildEmailAddress('support'));
    }
  };

  public authenticateWithWeb3 = async (params: AuthenticateWithWeb3Params): Promise<SignInResource> => {
    const { identifier, generateSignature } = params || {};
    if (!(typeof generateSignature === 'function')) {
      clerkMissingOptionError('generateSignature');
    }

    await this.create({ identifier });

    const web3FirstFactor = this.supportedFirstFactors.find(
      f => f.strategy === 'web3_metamask_signature',
    ) as Web3SignatureFactor;

    if (!web3FirstFactor) {
      clerkVerifyWeb3WalletCalledBeforeCreate('SignIn');
    }

    await this.prepareFirstFactor(web3FirstFactor);

    const { nonce } = this.firstFactorVerification;
    const signature = await generateSignature({
      identifier: this.identifier!,
      nonce: nonce!,
    });

    return this.attemptFirstFactor({
      signature,
      strategy: 'web3_metamask_signature',
    });
  };

  public authenticateWithMetamask = async (): Promise<SignInResource> => {
    const identifier = await getMetamaskIdentifier();
    return this.authenticateWithWeb3({
      identifier,
      generateSignature: generateSignatureWithMetamask,
    });
  };

  validatePassword: ReturnType<typeof createValidatePassword> = (password, cb) => {
    if (SignIn.clerk.__unstable__environment?.userSettings.passwordSettings) {
      return createValidatePassword({
        ...(SignIn.clerk.__unstable__environment?.userSettings.passwordSettings as any),
        validatePassword: true,
      })(password, cb);
    }
  };

  protected fromJSON(data: SignInJSON | null): this {
    if (data) {
      this.id = data.id;
      this.status = data.status;
      this.supportedIdentifiers = data.supported_identifiers;
      this.identifier = data.identifier;
      this.supportedFirstFactors = deepSnakeToCamel(data.supported_first_factors) as SignInFirstFactor[];
      this.supportedSecondFactors = deepSnakeToCamel(data.supported_second_factors) as SignInSecondFactor[];
      this.firstFactorVerification = new Verification(data.first_factor_verification);
      this.secondFactorVerification = new Verification(data.second_factor_verification);
      this.createdSessionId = data.created_session_id;
      this.userData = new UserData(data.user_data);
    }
    return this;
  }
}
