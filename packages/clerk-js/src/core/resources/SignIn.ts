import { deepSnakeToCamel, Poller } from '@clerk/shared';
import { isWebAuthnAutofillSupported, isWebAuthnSupported } from '@clerk/shared/webauthn';
import type {
  AttemptFirstFactorParams,
  AttemptSecondFactorParams,
  AuthenticateWithPasskeyParams,
  AuthenticateWithRedirectParams,
  AuthenticateWithWeb3Params,
  CreateEmailLinkFlowReturn,
  EmailCodeConfig,
  EmailLinkConfig,
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
  SignInResource,
  SignInSecondFactor,
  SignInStartEmailLinkFlowParams,
  SignInStatus,
  VerificationResource,
  Web3SignatureConfig,
  Web3SignatureFactor,
} from '@clerk/types';

import {
  generateSignatureWithCoinbase,
  generateSignatureWithMetamask,
  getCoinbaseIdentifier,
  getMetamaskIdentifier,
  windowNavigate,
} from '../../utils';
import {
  ClerkWebAuthnError,
  convertJSONToPublicKeyRequestOptions,
  serializePublicKeyCredentialAssertion,
  webAuthnGetCredential,
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
import { BaseResource, UserData, Verification } from './internal';

export class SignIn extends BaseResource implements SignInResource {
  pathRoot = '/client/sign_ins';

  id?: string;
  status: SignInStatus | null = null;
  supportedIdentifiers: SignInIdentifier[] = [];
  supportedFirstFactors: SignInFirstFactor[] = [];
  supportedSecondFactors: SignInSecondFactor[] | null = null;
  firstFactorVerification: VerificationResource = new Verification(null);
  secondFactorVerification: VerificationResource = new Verification(null);
  identifier: string | null = null;
  createdSessionId: string | null = null;
  userData: UserData = new UserData(null);

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
    const { identifier, generateSignature, strategy } = params || {};
    if (!(typeof generateSignature === 'function')) {
      clerkMissingOptionError('generateSignature');
    }

    await this.create({ identifier });

    const web3FirstFactor = this.supportedFirstFactors.find(f => f.strategy === strategy) as Web3SignatureFactor;

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

  public authenticateWithCoinbase = async (): Promise<SignInResource> => {
    const identifier = await getCoinbaseIdentifier();
    return this.authenticateWithWeb3({
      identifier,
      generateSignature: generateSignatureWithCoinbase,
      strategy: 'web3_coinbase_signature',
    });
  };

  public authenticateWithPasskey = async (params?: AuthenticateWithPasskeyParams): Promise<SignInResource> => {
    const { flow } = params || {};

    /**
     * The UI should always prevent from this method being called if WebAuthn is not supported.
     * As a precaution we need to check if WebAuthn is supported.
     */
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
      this.supportedSecondFactors = deepSnakeToCamel(data.supported_second_factors) as SignInSecondFactor[] | null;
      this.firstFactorVerification = new Verification(data.first_factor_verification);
      this.secondFactorVerification = new Verification(data.second_factor_verification);
      this.createdSessionId = data.created_session_id;
      this.userData = new UserData(data.user_data);
    }
    return this;
  }
}
