import { ClerkWebAuthnError } from '@clerk/shared/error';
import { Poller } from '@clerk/shared/poller';
import { deepCamelToSnake, deepSnakeToCamel } from '@clerk/shared/underscore';
import {
  isWebAuthnAutofillSupported as isWebAuthnAutofillSupportedOnWindow,
  isWebAuthnSupported as isWebAuthnSupportedOnWindow,
} from '@clerk/shared/webauthn';
import type {
  AttemptFirstFactorParams,
  AttemptSecondFactorParams,
  AuthenticateWithPasskeyParams,
  AuthenticateWithPopupParams,
  AuthenticateWithRedirectParams,
  AuthenticateWithWeb3Params,
  CreateEmailLinkFlowReturn,
  EmailCodeConfig,
  EmailLinkConfig,
  EnterpriseSSOConfig,
  OAuthStrategy,
  PassKeyConfig,
  PasskeyFactor,
  PhoneCodeConfig,
  PrepareFirstFactorParams,
  PrepareSecondFactorParams,
  ResetPasswordEmailCodeFactorConfig,
  ResetPasswordParams,
  ResetPasswordPhoneCodeFactorConfig,
  SamlConfig,
  SignInCreateParams,
  SignInFirstFactor,
  SignInFutureResource,
  SignInIdentifier,
  SignInJSON,
  SignInJSONSnapshot,
  SignInResource,
  SignInSecondFactor,
  SignInStartEmailLinkFlowParams,
  SignInStatus,
  VerificationResource,
  Web3Provider,
  Web3SignatureConfig,
  Web3SignatureFactor,
} from '@clerk/types';

import {
  buildURL,
  generateSignatureWithCoinbaseWallet,
  generateSignatureWithMetamask,
  generateSignatureWithOKXWallet,
  getCoinbaseWalletIdentifier,
  getMetamaskIdentifier,
  getOKXWalletIdentifier,
  windowNavigate,
} from '../../utils';
import { _authenticateWithPopup } from '../../utils/authenticateWithPopup';
import {
  convertJSONToPublicKeyRequestOptions,
  serializePublicKeyCredentialAssertion,
  webAuthnGetCredential as webAuthnGetCredentialOnWindow,
} from '../../utils/passkeys';
import { createValidatePassword } from '../../utils/passwords/password';
import {
  clerkInvalidFAPIResponse,
  clerkInvalidStrategy,
  clerkMissingOptionError,
  clerkMissingWebAuthnPublicKeyOptions,
  clerkVerifyEmailAddressCalledBeforeCreate,
  clerkVerifyPasskeyCalledBeforeCreate,
  clerkVerifyWeb3WalletCalledBeforeCreate,
} from '../errors';
import { eventBus } from '../events';
import { BaseResource, UserData, Verification } from './internal';

export class SignIn extends BaseResource implements SignInResource {
  pathRoot = '/client/sign_ins';

  id?: string;
  status: SignInStatus | null = null;
  supportedIdentifiers: SignInIdentifier[] = [];
  supportedFirstFactors: SignInFirstFactor[] | null = [];
  supportedSecondFactors: SignInSecondFactor[] | null = null;
  firstFactorVerification: VerificationResource = new Verification(null);
  secondFactorVerification: VerificationResource = new Verification(null);
  identifier: string | null = null;
  createdSessionId: string | null = null;
  userData: UserData = new UserData(null);

  /**
   * @experimental This experimental API is subject to change.
   *
   * An instance of `SignInFuture`, which has a different API than `SignIn`, intended to be used in custom flows.
   */
  __internal_future: SignInFuture | null = new SignInFuture(this);

  /**
   * @internal Only used for internal purposes, and is not intended to be used directly.
   *
   * This property is used to provide access to underlying Client methods to `SignInFuture`, which wraps an instance
   * of `SignIn`.
   */
  __internal_basePost = this._basePost.bind(this);

  constructor(data: SignInJSON | SignInJSONSnapshot | null = null) {
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
      case 'passkey':
        config = {} as PassKeyConfig;
        break;
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
          channel: factor.channel,
        } as PhoneCodeConfig;
        break;
      case 'web3_metamask_signature':
        config = { web3WalletId: factor.web3WalletId } as Web3SignatureConfig;
        break;
      case 'web3_coinbase_wallet_signature':
        config = { web3WalletId: factor.web3WalletId } as Web3SignatureConfig;
        break;
      case 'web3_okx_wallet_signature':
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
      case 'enterprise_sso':
        config = {
          redirectUrl: factor.redirectUrl,
          actionCompleteRedirectUrl: factor.actionCompleteRedirectUrl,
          oidcPrompt: factor.oidcPrompt,
        } as EnterpriseSSOConfig;
        break;
      default:
        clerkInvalidStrategy('SignIn.prepareFirstFactor', factor.strategy);
    }
    return this._basePost({
      body: { ...config, strategy: factor.strategy },
      action: 'prepare_first_factor',
    });
  };

  attemptFirstFactor = (attemptFactor: AttemptFirstFactorParams): Promise<SignInResource> => {
    let config;
    switch (attemptFactor.strategy) {
      case 'passkey':
        config = {
          publicKeyCredential: JSON.stringify(serializePublicKeyCredentialAssertion(attemptFactor.publicKeyCredential)),
        };
        break;
      default:
        config = { ...attemptFactor };
    }

    return this._basePost({
      body: { ...config, strategy: attemptFactor.strategy },
      action: 'attempt_first_factor',
    });
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

  private authenticateWithRedirectOrPopup = async (
    params: AuthenticateWithRedirectParams,
    navigateCallback: (url: URL | string) => void,
  ): Promise<void> => {
    const { strategy, redirectUrl, redirectUrlComplete, identifier, oidcPrompt, continueSignIn } = params || {};

    const redirectUrlWithAuthToken = SignIn.clerk.buildUrlWithAuth(redirectUrl);

    // When after-auth is enabled, redirect to SSO callback route.
    // This ensures organization selection tasks are displayed after sign-in,
    // rather than redirecting to potentially unprotected pages while the session is pending.
    const actionCompleteRedirectUrl = SignIn.clerk.__internal_hasAfterAuthFlows
      ? buildURL({
          base: redirectUrlWithAuthToken,
          search: `?redirect_url=${redirectUrlComplete}`,
        }).toString()
      : redirectUrlComplete;

    if (!this.id || !continueSignIn) {
      await this.create({
        strategy,
        identifier,
        redirectUrl: redirectUrlWithAuthToken,
        actionCompleteRedirectUrl,
      });
    }

    if (strategy === 'saml' || strategy === 'enterprise_sso') {
      await this.prepareFirstFactor({
        strategy,
        redirectUrl: SignIn.clerk.buildUrlWithAuth(redirectUrl),
        actionCompleteRedirectUrl,
        oidcPrompt,
      });
    }

    const { status, externalVerificationRedirectURL } = this.firstFactorVerification;

    if (status === 'unverified' && externalVerificationRedirectURL) {
      navigateCallback(externalVerificationRedirectURL);
    } else {
      clerkInvalidFAPIResponse(status, SignIn.fapiClient.buildEmailAddress('support'));
    }
  };

  public authenticateWithRedirect = async (params: AuthenticateWithRedirectParams): Promise<void> => {
    return this.authenticateWithRedirectOrPopup(params, windowNavigate);
  };

  public authenticateWithPopup = async (params: AuthenticateWithPopupParams): Promise<void> => {
    const { popup } = params || {};
    if (!popup) {
      clerkMissingOptionError('popup');
    }
    return _authenticateWithPopup(SignIn.clerk, 'signIn', this.authenticateWithRedirectOrPopup, params, url => {
      popup.location.href = url.toString();
    });
  };

  public authenticateWithWeb3 = async (params: AuthenticateWithWeb3Params): Promise<SignInResource> => {
    const { identifier, generateSignature, strategy = 'web3_metamask_signature' } = params || {};
    const provider = strategy.replace('web3_', '').replace('_signature', '') as Web3Provider;

    if (!(typeof generateSignature === 'function')) {
      clerkMissingOptionError('generateSignature');
    }

    await this.create({ identifier });

    const web3FirstFactor = this.supportedFirstFactors?.find(f => f.strategy === strategy) as Web3SignatureFactor;

    if (!web3FirstFactor) {
      clerkVerifyWeb3WalletCalledBeforeCreate('SignIn');
    }

    await this.prepareFirstFactor(web3FirstFactor);

    const { message } = this.firstFactorVerification;
    if (!message) {
      clerkVerifyWeb3WalletCalledBeforeCreate('SignIn');
    }

    let signature: string;
    try {
      signature = await generateSignature({ identifier, nonce: message, provider });
    } catch (err) {
      // There is a chance that as a user when you try to setup and use the Coinbase Wallet with an existing
      // Passkey in order to authenticate, the initial generate signature request to be rejected. For this
      // reason we retry the request once more in order for the flow to be able to be completed successfully.
      //
      // error code 4001 means the user rejected the request
      // Reference: https://docs.cdp.coinbase.com/wallet-sdk/docs/errors
      if (provider === 'coinbase_wallet' && err.code === 4001) {
        signature = await generateSignature({ identifier, nonce: message, provider });
      } else {
        throw err;
      }
    }

    return this.attemptFirstFactor({
      signature,
      strategy,
    });
  };

  public authenticateWithMetamask = async (): Promise<SignInResource> => {
    const identifier = await getMetamaskIdentifier();
    return this.authenticateWithWeb3({
      identifier,
      generateSignature: generateSignatureWithMetamask,
      strategy: 'web3_metamask_signature',
    });
  };

  public authenticateWithCoinbaseWallet = async (): Promise<SignInResource> => {
    const identifier = await getCoinbaseWalletIdentifier();
    return this.authenticateWithWeb3({
      identifier,
      generateSignature: generateSignatureWithCoinbaseWallet,
      strategy: 'web3_coinbase_wallet_signature',
    });
  };

  public authenticateWithOKXWallet = async (): Promise<SignInResource> => {
    const identifier = await getOKXWalletIdentifier();
    return this.authenticateWithWeb3({
      identifier,
      generateSignature: generateSignatureWithOKXWallet,
      strategy: 'web3_okx_wallet_signature',
    });
  };

  public authenticateWithPasskey = async (params?: AuthenticateWithPasskeyParams): Promise<SignInResource> => {
    const { flow } = params || {};

    /**
     * The UI should always prevent from this method being called if WebAuthn is not supported.
     * As a precaution we need to check if WebAuthn is supported.
     */

    const isWebAuthnSupported = SignIn.clerk.__internal_isWebAuthnSupported || isWebAuthnSupportedOnWindow;
    const webAuthnGetCredential = SignIn.clerk.__internal_getPublicCredentials || webAuthnGetCredentialOnWindow;
    const isWebAuthnAutofillSupported =
      SignIn.clerk.__internal_isWebAuthnAutofillSupported || isWebAuthnAutofillSupportedOnWindow;

    if (!isWebAuthnSupported()) {
      throw new ClerkWebAuthnError('Passkeys are not supported', {
        code: 'passkey_not_supported',
      });
    }

    if (flow === 'autofill' || flow === 'discoverable') {
      // @ts-ignore As this is experimental we want to support it at runtime, but not at the type level
      await this.create({ strategy: 'passkey' });
    } else {
      // @ts-ignore As this is experimental we want to support it at runtime, but not at the type level
      const passKeyFactor = this.supportedFirstFactors.find(
        // @ts-ignore As this is experimental we want to support it at runtime, but not at the type level
        f => f.strategy === 'passkey',
      ) as PasskeyFactor;

      if (!passKeyFactor) {
        clerkVerifyPasskeyCalledBeforeCreate();
      }
      // @ts-ignore As this is experimental we want to support it at runtime, but not at the type level
      await this.prepareFirstFactor(passKeyFactor);
    }

    const { nonce } = this.firstFactorVerification;
    const publicKeyOptions = nonce ? convertJSONToPublicKeyRequestOptions(JSON.parse(nonce)) : null;

    if (!publicKeyOptions) {
      clerkMissingWebAuthnPublicKeyOptions('get');
    }

    let canUseConditionalUI = false;

    if (flow === 'autofill') {
      /**
       * If autofill is not supported gracefully handle the result, we don't need to throw.
       * The caller should always check this before calling this method.
       */
      canUseConditionalUI = await isWebAuthnAutofillSupported();
    }

    // Invoke the navigator.create.get() method.
    const { publicKeyCredential, error } = await webAuthnGetCredential({
      publicKeyOptions,
      conditionalUI: canUseConditionalUI,
    });

    if (!publicKeyCredential) {
      throw error;
    }

    return this.attemptFirstFactor({
      publicKeyCredential,
      strategy: 'passkey',
    });
  };

  validatePassword: ReturnType<typeof createValidatePassword> = (password, cb) => {
    if (SignIn.clerk.__unstable__environment?.userSettings.passwordSettings) {
      return createValidatePassword({
        ...SignIn.clerk.__unstable__environment?.userSettings.passwordSettings,
        validatePassword: true,
      })(password, cb);
    }
  };

  protected fromJSON(data: SignInJSON | SignInJSONSnapshot | null): this {
    if (data) {
      this.id = data.id;
      this.status = data.status;
      this.supportedIdentifiers = data.supported_identifiers;
      this.identifier = data.identifier;
      this.supportedFirstFactors = deepSnakeToCamel(data.supported_first_factors) as SignInFirstFactor[] | null;
      this.supportedSecondFactors = deepSnakeToCamel(data.supported_second_factors) as SignInSecondFactor[] | null;
      this.firstFactorVerification = new Verification(data.first_factor_verification);
      this.secondFactorVerification = new Verification(data.second_factor_verification);
      this.createdSessionId = data.created_session_id;
      this.userData = new UserData(data.user_data);
    }

    eventBus.emit('resource:update', { resource: this });
    return this;
  }

  public __internal_toSnapshot(): SignInJSONSnapshot {
    return {
      object: 'sign_in',
      id: this.id || '',
      status: this.status || null,
      supported_identifiers: this.supportedIdentifiers,
      supported_first_factors: deepCamelToSnake(this.supportedFirstFactors),
      supported_second_factors: deepCamelToSnake(this.supportedSecondFactors),
      first_factor_verification: this.firstFactorVerification.__internal_toSnapshot(),
      second_factor_verification: this.secondFactorVerification.__internal_toSnapshot(),
      identifier: this.identifier,
      created_session_id: this.createdSessionId,
      user_data: this.userData.__internal_toSnapshot(),
    };
  }
}

class SignInFuture implements SignInFutureResource {
  emailCode = {
    sendCode: this.sendEmailCode.bind(this),
    verifyCode: this.verifyEmailCode.bind(this),
  };

  resetPasswordEmailCode = {
    sendCode: this.sendResetPasswordEmailCode.bind(this),
    verifyCode: this.verifyResetPasswordEmailCode.bind(this),
    submitPassword: this.submitResetPassword.bind(this),
  };

  constructor(readonly resource: SignIn) {}

  get status() {
    return this.resource.status;
  }

  async sendResetPasswordEmailCode(): Promise<{ error: unknown }> {
    eventBus.emit('resource:error', { resource: this.resource, error: null });
    try {
      if (!this.resource.id) {
        throw new Error('Cannot reset password without a sign in.');
      }

      const resetPasswordEmailCodeFactor = this.resource.supportedFirstFactors?.find(
        f => f.strategy === 'reset_password_email_code',
      );

      if (!resetPasswordEmailCodeFactor) {
        throw new Error('Reset password email code factor not found');
      }

      const { emailAddressId } = resetPasswordEmailCodeFactor;
      await this.resource.__internal_basePost({
        body: { emailAddressId, strategy: 'reset_password_email_code' },
        action: 'prepare_first_factor',
      });
    } catch (err: unknown) {
      eventBus.emit('resource:error', { resource: this.resource, error: err });
      return { error: err };
    }

    return { error: null };
  }

  async verifyResetPasswordEmailCode({ code }: { code: string }): Promise<{ error: unknown }> {
    eventBus.emit('resource:error', { resource: this.resource, error: null });
    try {
      await this.resource.__internal_basePost({
        body: { code, strategy: 'reset_password_email_code' },
        action: 'attempt_first_factor',
      });
    } catch (err: unknown) {
      eventBus.emit('resource:error', { resource: this.resource, error: err });
      return { error: err };
    }

    return { error: null };
  }

  async submitResetPassword({
    password,
    signOutOfOtherSessions = true,
  }: {
    password: string;
    signOutOfOtherSessions?: boolean;
  }): Promise<{ error: unknown }> {
    eventBus.emit('resource:error', { resource: this.resource, error: null });
    try {
      await this.resource.__internal_basePost({
        body: { password, signOutOfOtherSessions },
        action: 'reset_password',
      });
    } catch (err: unknown) {
      eventBus.emit('resource:error', { resource: this.resource, error: err });
      return { error: err };
    }

    return { error: null };
  }

  async create(params: {
    identifier?: string;
    strategy?: OAuthStrategy | 'saml' | 'enterprise_sso';
    redirectUrl?: string;
    actionCompleteRedirectUrl?: string;
  }): Promise<{ error: unknown }> {
    eventBus.emit('resource:error', { resource: this.resource, error: null });
    try {
      await this.resource.__internal_basePost({
        path: this.resource.pathRoot,
        body: params,
      });

      return { error: null };
    } catch (err: unknown) {
      eventBus.emit('resource:error', { resource: this.resource, error: err });
      return { error: err };
    }
  }

  async password({ identifier, password }: { identifier: string; password: string }): Promise<{ error: unknown }> {
    eventBus.emit('resource:error', { resource: this.resource, error: null });
    try {
      await this.resource.__internal_basePost({
        path: this.resource.pathRoot,
        body: { identifier, password },
      });
    } catch (err: unknown) {
      eventBus.emit('resource:error', { resource: this.resource, error: err });
      return { error: err };
    }

    return { error: null };
  }

  async sendEmailCode({ email }: { email: string }): Promise<{ error: unknown }> {
    eventBus.emit('resource:error', { resource: this.resource, error: null });
    try {
      if (!this.resource.id) {
        await this.create({ identifier: email });
      }

      const emailCodeFactor = this.resource.supportedFirstFactors?.find(f => f.strategy === 'email_code');

      if (!emailCodeFactor) {
        throw new Error('Email code factor not found');
      }

      const { emailAddressId } = emailCodeFactor;
      await this.resource.__internal_basePost({
        body: { emailAddressId, strategy: 'email_code' },
        action: 'prepare_first_factor',
      });
    } catch (err: unknown) {
      eventBus.emit('resource:error', { resource: this.resource, error: err });
      return { error: err };
    }

    return { error: null };
  }

  async verifyEmailCode({ code }: { code: string }): Promise<{ error: unknown }> {
    eventBus.emit('resource:error', { resource: this.resource, error: null });
    try {
      await this.resource.__internal_basePost({
        body: { code, strategy: 'email_code' },
        action: 'attempt_first_factor',
      });
    } catch (err: unknown) {
      eventBus.emit('resource:error', { resource: this.resource, error: err });
      return { error: err };
    }

    return { error: null };
  }

  async sso({
    flow = 'auto',
    strategy,
    redirectUrl,
    redirectUrlComplete,
  }: {
    flow?: 'auto' | 'modal';
    strategy: OAuthStrategy | 'saml' | 'enterprise_sso';
    redirectUrl: string;
    redirectUrlComplete: string;
  }): Promise<{ error: unknown }> {
    eventBus.emit('resource:error', { resource: this.resource, error: null });
    try {
      if (flow !== 'auto') {
        throw new Error('modal flow is not supported yet');
      }

      const redirectUrlWithAuthToken = SignIn.clerk.buildUrlWithAuth(redirectUrl);

      if (!this.resource.id) {
        await this.create({
          strategy,
          redirectUrl: redirectUrlWithAuthToken,
          actionCompleteRedirectUrl: redirectUrlComplete,
        });
      }

      const { status, externalVerificationRedirectURL } = this.resource.firstFactorVerification;

      if (status === 'unverified' && externalVerificationRedirectURL) {
        windowNavigate(externalVerificationRedirectURL);
      }
    } catch (err: unknown) {
      eventBus.emit('resource:error', { resource: this.resource, error: err });
      return { error: err };
    }

    return { error: null };
  }
}
