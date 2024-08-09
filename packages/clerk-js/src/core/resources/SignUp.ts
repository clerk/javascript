import { Poller } from '@clerk/shared';
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
  SignUpAuthenticateWithMetamaskParams,
  SignUpCreateParams,
  SignUpField,
  SignUpIdentificationField,
  SignUpJSON,
  SignUpResource,
  SignUpStatus,
  SignUpUpdateParams,
  StartEmailLinkFlowParams,
  Web3Strategy,
} from '@clerk/types';

import {
  generateSignatureWithCoinbase,
  generateSignatureWithMetamask,
  getCoinbaseIdentifier,
  getMetamaskIdentifier,
  windowNavigate,
} from '../../utils';
import { getCaptchaToken, retrieveCaptchaInfo } from '../../utils/captcha';
import { createValidatePassword } from '../../utils/passwords/password';
import { normalizeUnsafeMetadata } from '../../utils/resourceParams';
import {
  clerkInvalidFAPIResponse,
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

  constructor(data: SignUpJSON | null = null) {
    super();
    this.fromJSON(data);
  }

  create = async (params: SignUpCreateParams): Promise<SignUpResource> => {
    const paramsWithCaptcha: Record<string, unknown> = params;
    const { captchaSiteKey, canUseCaptcha, captchaURL, captchaWidgetType, captchaProvider, captchaPublicKeyInvisible } =
      retrieveCaptchaInfo(SignUp.clerk);

    if (
      !this.shouldBypassCaptchaForAttempt(params) &&
      canUseCaptcha &&
      captchaSiteKey &&
      captchaURL &&
      captchaPublicKeyInvisible
    ) {
      try {
        const { captchaToken, captchaWidgetTypeUsed } = await getCaptchaToken({
          siteKey: captchaSiteKey,
          widgetType: captchaWidgetType,
          invisibleSiteKey: captchaPublicKeyInvisible,
          scriptUrl: captchaURL,
          captchaProvider,
        });
        paramsWithCaptcha.captchaToken = captchaToken;
        paramsWithCaptcha.captchaWidgetType = captchaWidgetTypeUsed;
      } catch (e) {
        if (e.captchaError) {
          paramsWithCaptcha.captchaError = e.captchaError;
        } else {
          throw new ClerkRuntimeError(e.message, { code: 'captcha_unavailable' });
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

  prepareWeb3WalletVerification = (strategy: Web3Strategy): Promise<SignUpResource> => {
    return this.prepareVerification({ strategy });
  };

  attemptWeb3WalletVerification = async (params: AttemptWeb3WalletVerificationParams): Promise<SignUpResource> => {
    const { signature, strategy } = params;
    return this.attemptVerification({ signature, strategy });
  };

  public authenticateWithWeb3 = async (
    params: AuthenticateWithWeb3Params & { unsafeMetadata?: SignUpUnsafeMetadata },
  ): Promise<SignUpResource> => {
    const { generateSignature, identifier, strategy, unsafeMetadata } = params || {};
    const web3Wallet = identifier || this.web3wallet!;
    await this.create({ web3Wallet, unsafeMetadata });
    await this.prepareWeb3WalletVerification(strategy);

    const { nonce } = this.verifications.web3Wallet;
    if (!nonce) {
      clerkVerifyWeb3WalletCalledBeforeCreate('SignUp');
    }

    const signature = await generateSignature({ identifier, nonce });
    return this.attemptWeb3WalletVerification({ signature, strategy });
  };

  public authenticateWithMetamask = async (params?: SignUpAuthenticateWithMetamaskParams): Promise<SignUpResource> => {
    const identifier = await getMetamaskIdentifier();
    return this.authenticateWithWeb3({
      identifier,
      generateSignature: generateSignatureWithMetamask,
      strategy: 'web3_metamask_signature',
      unsafeMetadata: params?.unsafeMetadata,
    });
  };

  public authenticateWithCoinbase = async (params?: SignUpAuthenticateWithMetamaskParams): Promise<SignUpResource> => {
    const identifier = await getCoinbaseIdentifier();
    return this.authenticateWithWeb3({
      identifier,
      generateSignature: generateSignatureWithCoinbase,
      strategy: 'web3_coinbase_signature',
      unsafeMetadata: params?.unsafeMetadata,
    });
  };

  public authenticateWithRedirect = async ({
    redirectUrl,
    redirectUrlComplete,
    strategy,
    continueSignUp = false,
    unsafeMetadata,
    emailAddress,
  }: AuthenticateWithRedirectParams & {
    unsafeMetadata?: SignUpUnsafeMetadata;
  }): Promise<void> => {
    const authenticateFn = (args: SignUpCreateParams | SignUpUpdateParams) =>
      continueSignUp && this.id ? this.update(args) : this.create(args);

    const { verifications } = await authenticateFn({
      strategy,
      redirectUrl: SignUp.clerk.buildUrlWithAuth(redirectUrl),
      actionCompleteRedirectUrl: redirectUrlComplete,
      unsafeMetadata,
      emailAddress,
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

  validatePassword: ReturnType<typeof createValidatePassword> = (password, cb) => {
    if (SignUp.clerk.__unstable__environment?.userSettings.passwordSettings) {
      return createValidatePassword({
        ...(SignUp.clerk.__unstable__environment?.userSettings.passwordSettings as any),
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
    }
    return this;
  }

  /**
   * We delegate bot detection to the following providers, instead of relying on turnstile exclusively
   */
  protected shouldBypassCaptchaForAttempt(params: SignUpCreateParams) {
    if (
      params.strategy === 'oauth_google' ||
      params.strategy === 'oauth_microsoft' ||
      params.strategy === 'oauth_apple'
    ) {
      return true;
    }
    if (
      params.transfer &&
      (SignUp.clerk.client?.signIn.firstFactorVerification.strategy === 'oauth_google' ||
        SignUp.clerk.client?.signIn.firstFactorVerification.strategy === 'oauth_microsoft' ||
        SignUp.clerk.client?.signIn.firstFactorVerification.strategy === 'oauth_apple')
    ) {
      return true;
    }

    return false;
  }
}
