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
  AuthenticateWithRedirectParams,
  AuthenticateWithWeb3Params,
  CreateEmailLinkFlowReturn,
  EmailCodeConfig,
  EmailLinkConfig,
  EnterpriseSSOConfig,
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
  generateSignatureWithCoinbaseWallet,
  generateSignatureWithMetamask,
  generateSignatureWithOKXWallet,
  getCoinbaseWalletIdentifier,
  getMetamaskIdentifier,
  getOKXWalletIdentifier,
  windowNavigate,
} from '../../utils';
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
  clerkUnsupportedEnvironmentWarning,
  clerkVerifyEmailAddressCalledBeforeCreate,
  clerkVerifyPasskeyCalledBeforeCreate,
  clerkVerifyWeb3WalletCalledBeforeCreate,
} from '../errors';
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

  public authenticateWithRedirect = async ({
    strategy,
    redirectUrl,
    redirectUrlComplete,
    identifier,
    continueSignIn = false,
  }: AuthenticateWithRedirectParams): Promise<void> => {
    if (!this.id || !continueSignIn) {
      await this.create({
        strategy,
        identifier,
        redirectUrl: SignIn.clerk.buildUrlWithAuth(redirectUrl),
        actionCompleteRedirectUrl: redirectUrlComplete,
      });
    }

    if (strategy === 'saml' || strategy === 'enterprise_sso') {
      await this.prepareFirstFactor({
        strategy,
        redirectUrl: SignIn.clerk.buildUrlWithAuth(redirectUrl),
        actionCompleteRedirectUrl: redirectUrlComplete,
      });
    }

    const { status, externalVerificationRedirectURL } = this.firstFactorVerification;

    if (status === 'unverified' && externalVerificationRedirectURL) {
      windowNavigate(externalVerificationRedirectURL);
    } else {
      clerkInvalidFAPIResponse(status, SignIn.fapiClient.buildEmailAddress('support'));
    }
  };

  public authenticateWithWeb3 = async (params: AuthenticateWithWeb3Params): Promise<SignInResource> => {
    if (__BUILD_DISABLE_RHC__) {
      clerkUnsupportedEnvironmentWarning('Web3');
      return this;
    }

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
    if (__BUILD_DISABLE_RHC__) {
      clerkUnsupportedEnvironmentWarning('Metamask');
      return this;
    }

    const identifier = await getMetamaskIdentifier();
    return this.authenticateWithWeb3({
      identifier,
      generateSignature: generateSignatureWithMetamask,
      strategy: 'web3_metamask_signature',
    });
  };

  public authenticateWithCoinbaseWallet = async (): Promise<SignInResource> => {
    if (__BUILD_DISABLE_RHC__) {
      clerkUnsupportedEnvironmentWarning('Coinbase Wallet');
      return this;
    }

    const identifier = await getCoinbaseWalletIdentifier();
    return this.authenticateWithWeb3({
      identifier,
      generateSignature: generateSignatureWithCoinbaseWallet,
      strategy: 'web3_coinbase_wallet_signature',
    });
  };

  public authenticateWithOKXWallet = async (): Promise<SignInResource> => {
    if (__BUILD_DISABLE_RHC__) {
      clerkUnsupportedEnvironmentWarning('OKX Wallet');
      return this;
    }

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
