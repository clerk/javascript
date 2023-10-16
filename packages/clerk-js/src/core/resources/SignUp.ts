import { deprecated, Poller } from '@clerk/shared';
import type {
  AttemptEmailAddressVerificationParams,
  AttemptPhoneNumberVerificationParams,
  AttemptVerificationParams,
  AttemptWeb3WalletVerificationParams,
  AuthenticateWithRedirectParams,
  AuthenticateWithWeb3Params,
  CreateEmailLinkFlowReturn,
  CreateMagicLinkFlowReturn,
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
  StartMagicLinkFlowParams,
} from '@clerk/types';

import { generateSignatureWithMetamask, getCaptchaToken, getMetamaskIdentifier, windowNavigate } from '../../utils';
import { createValidatePassword } from '../../utils/passwords/password';
import { normalizeUnsafeMetadata } from '../../utils/resourceParams';
import {
  clerkInvalidFAPIResponse,
  clerkMissingOptionError,
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
    const { experimental_captchaSiteKey, experimental_canUseCaptcha, experimental_captchaURL } = SignUp.clerk;

    if (experimental_canUseCaptcha && experimental_captchaSiteKey && experimental_captchaURL) {
      try {
        paramsWithCaptcha.captchaToken = await getCaptchaToken({
          siteKey: experimental_captchaSiteKey,
          scriptUrl: experimental_captchaURL,
        });
      } catch (e) {
        if (e.captchaError) {
          paramsWithCaptcha.captchaError = e.captchaError;
        } else {
          throw new ClerkRuntimeError(e.message, { code: 'captcha_unavailable' });
        }
      }
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

  /**
   * @deprecated Use `createEmailLinkFlow` instead.
   */
  createMagicLinkFlow = (): CreateMagicLinkFlowReturn<StartMagicLinkFlowParams, SignUpResource> => {
    deprecated('createMagicLinkFlow', 'Use `createEmailLinkFlow` instead.');

    const { run, stop } = Poller();

    const startMagicLinkFlow = async ({ redirectUrl }: StartMagicLinkFlowParams): Promise<SignUpResource> => {
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

    return { startMagicLinkFlow, cancelMagicLinkFlow: stop };
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

  prepareWeb3WalletVerification = (): Promise<SignUpResource> => {
    return this.prepareVerification({ strategy: 'web3_metamask_signature' });
  };

  attemptWeb3WalletVerification = async (params: AttemptWeb3WalletVerificationParams): Promise<SignUpResource> => {
    const { signature, generateSignature } = params || {};

    if (generateSignature) {
      deprecated('generateSignature', 'Use signature field instead.');
    }

    if (signature) {
      return this.attemptVerification({ signature, strategy: 'web3_metamask_signature' });
    }

    if (!(typeof generateSignature === 'function')) {
      clerkMissingOptionError('generateSignature');
    }

    const { nonce } = this.verifications.web3Wallet;
    if (!nonce) {
      clerkVerifyWeb3WalletCalledBeforeCreate('SignUp');
    }

    const generatedSignature = await generateSignature({ identifier: this.web3wallet!, nonce });
    return this.attemptVerification({ signature: generatedSignature, strategy: 'web3_metamask_signature' });
  };

  public authenticateWithWeb3 = async (
    params: AuthenticateWithWeb3Params & { unsafeMetadata?: SignUpUnsafeMetadata },
  ): Promise<SignUpResource> => {
    const { generateSignature, identifier, unsafeMetadata } = params || {};
    const web3Wallet = identifier || this.web3wallet!;
    await this.create({ web3Wallet, unsafeMetadata });
    await this.prepareWeb3WalletVerification();

    const { nonce } = this.verifications.web3Wallet;
    if (!nonce) {
      clerkVerifyWeb3WalletCalledBeforeCreate('SignUp');
    }

    const signature = await generateSignature({ identifier, nonce });
    return this.attemptWeb3WalletVerification({ signature });
  };

  public authenticateWithMetamask = async (params?: SignUpAuthenticateWithMetamaskParams): Promise<SignUpResource> => {
    const identifier = await getMetamaskIdentifier();
    return this.authenticateWithWeb3({
      identifier,
      generateSignature: generateSignatureWithMetamask,
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
}
