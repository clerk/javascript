import { isCaptchaError, isClerkAPIResponseError } from '@clerk/shared/error';
import { Poller } from '@clerk/shared/poller';
import type {
  AttemptEmailAddressVerificationParams,
  AttemptPhoneNumberVerificationParams,
  AttemptVerificationParams,
  AttemptWeb3WalletVerificationParams,
  AuthenticateWithRedirectParams,
  AuthenticateWithWeb3Params,
  CreateEmailLinkFlowReturn,
  PrepareEmailAddressVerificationParams,
  PreparePhoneNumberVerificationParams,
  PrepareVerificationParams,
  PrepareWeb3WalletVerificationParams,
  SignUpAuthenticateWithWeb3Params,
  SignUpCreateParams,
  SignUpField,
  SignUpIdentificationField,
  SignUpJSON,
  SignUpResource,
  SignUpStatus,
  SignUpUpdateParams,
  StartEmailLinkFlowParams,
  Web3Provider,
} from '@clerk/types';

import {
  generateSignatureWithCoinbaseWallet,
  generateSignatureWithMetamask,
  generateSignatureWithOKXWallet,
  getCoinbaseWalletIdentifier,
  getMetamaskIdentifier,
  getOKXWalletIdentifier,
  windowNavigate,
} from '../../utils';
import { getCaptchaToken, retrieveCaptchaInfo } from '../../utils/captcha';
import { createValidatePassword } from '../../utils/passwords/password';
import { normalizeUnsafeMetadata } from '../../utils/resourceParams';
import {
  clerkInvalidFAPIResponse,
  clerkMissingOptionError,
  clerkUnsupportedEnvironmentWarning,
  clerkVerifyEmailAddressCalledBeforeCreate,
  clerkVerifyWeb3WalletCalledBeforeCreate,
} from '../errors';
import { BaseResource, ClerkRuntimeError, SignUpVerifications } from './internal';

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
  unsafeMetadata: SignUpUnsafeMetadata = {};
  createdSessionId: string | null = null;
  createdUserId: string | null = null;
  abandonAt: number | null = null;
  legalAcceptedAt: number | null = null;

  constructor(data: SignUpJSON | null = null) {
    super();
    this.fromJSON(data);
  }

  create = async (params: SignUpCreateParams): Promise<SignUpResource> => {
    const paramsWithCaptcha: Record<string, unknown> = params;

    if (!__BUILD_DISABLE_RHC__) {
      const {
        captchaSiteKey,
        canUseCaptcha,
        captchaURL,
        captchaWidgetType,
        captchaProvider,
        captchaPublicKeyInvisible,
      } = retrieveCaptchaInfo(SignUp.clerk);

      if (
        !this.shouldBypassCaptchaForAttempt(params) &&
        canUseCaptcha &&
        captchaSiteKey &&
        captchaURL &&
        captchaPublicKeyInvisible
      ) {
        try {
          const captchaParams = await getCaptchaToken({
            siteKey: captchaSiteKey,
            widgetType: captchaWidgetType,
            invisibleSiteKey: captchaPublicKeyInvisible,
            scriptUrl: captchaURL,
            captchaProvider,
          });

          paramsWithCaptcha.captchaToken = captchaParams.captchaToken;
          paramsWithCaptcha.captchaWidgetType = captchaParams.captchaWidgetType;
        } catch (e) {
          if (e.captchaError) {
            paramsWithCaptcha.captchaError = e.captchaError;
          } else {
            throw new ClerkRuntimeError(e.message, { code: 'captcha_unavailable' });
          }
        }
      }
    }

    if (params.transfer && this.shouldBypassCaptchaForAttempt(params)) {
      paramsWithCaptcha.strategy = SignUp.clerk.client?.signIn.firstFactorVerification.strategy;
    }

    return this._basePost({
      path: this.pathRoot,
      body: normalizeUnsafeMetadata(paramsWithCaptcha),
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

  createEmailLinkFlow = (): CreateEmailLinkFlowReturn<StartEmailLinkFlowParams, SignUpResource> => {
    const { run, stop } = Poller();

    const startEmailLinkFlow = async ({ redirectUrl }: StartEmailLinkFlowParams): Promise<SignUpResource> => {
      if (!this.id) {
        clerkVerifyEmailAddressCalledBeforeCreate('SignUp');
      }
      await this.prepareEmailAddressVerification({
        strategy: 'email_link',
        redirectUrl,
      });

      return new Promise((resolve, reject) => {
        void run(() => {
          return this.reload()
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

    return { startEmailLinkFlow, cancelEmailLinkFlow: stop };
  };

  preparePhoneNumberVerification = (params?: PreparePhoneNumberVerificationParams): Promise<SignUpResource> => {
    return this.prepareVerification(params || { strategy: 'phone_code' });
  };

  attemptPhoneNumberVerification = (params: AttemptPhoneNumberVerificationParams): Promise<SignUpResource> => {
    return this.attemptVerification({ ...params, strategy: 'phone_code' });
  };

  prepareWeb3WalletVerification = (params?: PrepareWeb3WalletVerificationParams): Promise<SignUpResource> => {
    return this.prepareVerification({ strategy: 'web3_metamask_signature', ...params });
  };

  attemptWeb3WalletVerification = async (params: AttemptWeb3WalletVerificationParams): Promise<SignUpResource> => {
    const { signature, strategy = 'web3_metamask_signature' } = params;
    return this.attemptVerification({ signature, strategy });
  };

  public authenticateWithWeb3 = async (
    params: AuthenticateWithWeb3Params & {
      unsafeMetadata?: SignUpUnsafeMetadata;
      legalAccepted?: boolean;
    },
  ): Promise<SignUpResource> => {
    if (__BUILD_DISABLE_RHC__) {
      clerkUnsupportedEnvironmentWarning('Web3');
      return this;
    }

    const {
      generateSignature,
      identifier,
      unsafeMetadata,
      strategy = 'web3_metamask_signature',
      legalAccepted,
    } = params || {};
    const provider = strategy.replace('web3_', '').replace('_signature', '') as Web3Provider;

    if (!(typeof generateSignature === 'function')) {
      clerkMissingOptionError('generateSignature');
    }

    const web3Wallet = identifier || this.web3wallet!;
    await this.create({ web3Wallet, unsafeMetadata, legalAccepted });
    await this.prepareWeb3WalletVerification({ strategy });

    const { message } = this.verifications.web3Wallet;
    if (!message) {
      clerkVerifyWeb3WalletCalledBeforeCreate('SignUp');
    }

    let signature: string;
    try {
      signature = await generateSignature({ identifier, nonce: message, provider });
    } catch (err) {
      // There is a chance that as a first time visitor when you try to setup and use the
      // Coinbase Wallet from scratch in order to authenticate, the initial generate
      // signature request to be rejected. For this reason we retry the request once more
      // in order for the flow to be able to be completed successfully.
      //
      // error code 4001 means the user rejected the request
      // Reference: https://docs.cdp.coinbase.com/wallet-sdk/docs/errors
      if (provider === 'coinbase_wallet' && err.code === 4001) {
        signature = await generateSignature({ identifier, nonce: message, provider });
      } else {
        throw err;
      }
    }

    return this.attemptWeb3WalletVerification({ signature, strategy });
  };

  public authenticateWithMetamask = async (
    params?: SignUpAuthenticateWithWeb3Params & {
      legalAccepted?: boolean;
    },
  ): Promise<SignUpResource> => {
    if (__BUILD_DISABLE_RHC__) {
      clerkUnsupportedEnvironmentWarning('Metamask');
      return this;
    }

    const identifier = await getMetamaskIdentifier();
    return this.authenticateWithWeb3({
      identifier,
      generateSignature: generateSignatureWithMetamask,
      unsafeMetadata: params?.unsafeMetadata,
      strategy: 'web3_metamask_signature',
      legalAccepted: params?.legalAccepted,
    });
  };

  public authenticateWithCoinbaseWallet = async (
    params?: SignUpAuthenticateWithWeb3Params & {
      legalAccepted?: boolean;
    },
  ): Promise<SignUpResource> => {
    if (__BUILD_DISABLE_RHC__) {
      clerkUnsupportedEnvironmentWarning('Coinbase Wallet');
      return this;
    }

    const identifier = await getCoinbaseWalletIdentifier();
    return this.authenticateWithWeb3({
      identifier,
      generateSignature: generateSignatureWithCoinbaseWallet,
      unsafeMetadata: params?.unsafeMetadata,
      strategy: 'web3_coinbase_wallet_signature',
      legalAccepted: params?.legalAccepted,
    });
  };

  public authenticateWithOKXWallet = async (
    params?: SignUpAuthenticateWithWeb3Params & {
      legalAccepted?: boolean;
    },
  ): Promise<SignUpResource> => {
    if (__BUILD_DISABLE_RHC__) {
      clerkUnsupportedEnvironmentWarning('OKX Wallet');
      return this;
    }

    const identifier = await getOKXWalletIdentifier();
    return this.authenticateWithWeb3({
      identifier,
      generateSignature: generateSignatureWithOKXWallet,
      unsafeMetadata: params?.unsafeMetadata,
      strategy: 'web3_okx_wallet_signature',
      legalAccepted: params?.legalAccepted,
    });
  };

  public authenticateWithRedirect = async ({
    redirectUrl,
    redirectUrlComplete,
    strategy,
    continueSignUp = false,
    unsafeMetadata,
    emailAddress,
    legalAccepted,
  }: AuthenticateWithRedirectParams & {
    unsafeMetadata?: SignUpUnsafeMetadata;
  }): Promise<void> => {
    const authenticateFn = () => {
      const params = {
        strategy,
        redirectUrl: SignUp.clerk.buildUrlWithAuth(redirectUrl),
        actionCompleteRedirectUrl: redirectUrlComplete,
        unsafeMetadata,
        emailAddress,
        legalAccepted,
      };
      return continueSignUp && this.id ? this.update(params) : this.create(params);
    };

    const { verifications } = await authenticateFn().catch(async e => {
      // If captcha verification failed because the environment has changed, we need
      // to reload the environment and try again one more time with the new environment.
      // If this fails again, we will let the caller handle the error accordingly.
      if (isClerkAPIResponseError(e) && isCaptchaError(e)) {
        await SignUp.clerk.__unstable__environment!.reload();
        return authenticateFn();
      }
      throw e;
    });

    const { externalAccount } = verifications;
    const { status, externalVerificationRedirectURL } = externalAccount;

    if (status === 'unverified' && !!externalVerificationRedirectURL) {
      windowNavigate(externalVerificationRedirectURL);
    } else {
      clerkInvalidFAPIResponse(status, SignUp.fapiClient.buildEmailAddress('support'));
    }
  };

  update = (params: SignUpUpdateParams): Promise<SignUpResource> => {
    return this._basePatch({
      body: normalizeUnsafeMetadata(params),
    });
  };

  upsert = (params: SignUpCreateParams | SignUpUpdateParams): Promise<SignUpResource> => {
    return this.id ? this.update(params) : this.create(params);
  };

  validatePassword: ReturnType<typeof createValidatePassword> = (password, cb) => {
    if (SignUp.clerk.__unstable__environment?.userSettings.passwordSettings) {
      return createValidatePassword({
        ...SignUp.clerk.__unstable__environment?.userSettings.passwordSettings,
        validatePassword: true,
      })(password, cb);
    }
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
      this.createdUserId = data.created_user_id;
      this.abandonAt = data.abandon_at;
      this.web3wallet = data.web3_wallet;
      this.legalAcceptedAt = data.legal_accepted_at;
    }
    return this;
  }

  /**
   * We delegate bot detection to the following providers, instead of relying on turnstile exclusively
   */
  protected shouldBypassCaptchaForAttempt(params: SignUpCreateParams) {
    if (!params.strategy) {
      return false;
    }

    const captchaOauthBypass = SignUp.clerk.__unstable__environment!.displayConfig.captchaOauthBypass;

    if (captchaOauthBypass.some(strategy => strategy === params.strategy)) {
      return true;
    }

    if (
      params.transfer &&
      captchaOauthBypass.some(strategy => strategy === SignUp.clerk.client!.signIn.firstFactorVerification.strategy)
    ) {
      return true;
    }

    return false;
  }
}
