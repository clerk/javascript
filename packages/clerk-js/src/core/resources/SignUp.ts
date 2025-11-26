import { type ClerkError, ClerkRuntimeError, isCaptchaError, isClerkAPIResponseError } from '@clerk/shared/error';
import { createValidatePassword } from '@clerk/shared/internal/clerk-js/passwords/password';
import { windowNavigate } from '@clerk/shared/internal/clerk-js/windowNavigate';
import { Poller } from '@clerk/shared/poller';
import type {
  AttemptEmailAddressVerificationParams,
  AttemptPhoneNumberVerificationParams,
  AttemptVerificationParams,
  AttemptWeb3WalletVerificationParams,
  AuthenticateWithPopupParams,
  AuthenticateWithRedirectParams,
  AuthenticateWithWeb3Params,
  CaptchaWidgetType,
  CreateEmailLinkFlowReturn,
  PrepareEmailAddressVerificationParams,
  PreparePhoneNumberVerificationParams,
  PrepareVerificationParams,
  PrepareWeb3WalletVerificationParams,
  SignUpAuthenticateWithWeb3Params,
  SignUpCreateParams,
  SignUpEnterpriseConnectionJSON,
  SignUpEnterpriseConnectionResource,
  SignUpField,
  SignUpFutureCreateParams,
  SignUpFutureEmailCodeVerifyParams,
  SignUpFutureFinalizeParams,
  SignUpFuturePasswordParams,
  SignUpFuturePhoneCodeSendParams,
  SignUpFuturePhoneCodeVerifyParams,
  SignUpFutureResource,
  SignUpFutureSSOParams,
  SignUpFutureTicketParams,
  SignUpFutureUpdateParams,
  SignUpFutureWeb3Params,
  SignUpIdentificationField,
  SignUpJSON,
  SignUpJSONSnapshot,
  SignUpResource,
  SignUpStatus,
  SignUpUpdateParams,
  StartEmailLinkFlowParams,
  Web3Provider,
} from '@clerk/shared/types';

import { debugLogger } from '@/utils/debug';

import { getBrowserLocale, getClerkQueryParam, web3 } from '../../utils';
import {
  _authenticateWithPopup,
  _futureAuthenticateWithPopup,
  wrapWithPopupRoutes,
} from '../../utils/authenticateWithPopup';
import { CaptchaChallenge } from '../../utils/captcha/CaptchaChallenge';
import { normalizeUnsafeMetadata } from '../../utils/resourceParams';
import { runAsyncResourceTask } from '../../utils/runAsyncResourceTask';
import { loadZxcvbn } from '../../utils/zxcvbn';
import {
  clerkInvalidFAPIResponse,
  clerkMissingOptionError,
  clerkVerifyEmailAddressCalledBeforeCreate,
  clerkVerifyWeb3WalletCalledBeforeCreate,
} from '../errors';
import { eventBus } from '../events';
import { BaseResource, SignUpVerifications } from './internal';

declare global {
  interface Window {
    ethereum: any;
  }
}

export class SignUp extends BaseResource implements SignUpResource {
  pathRoot = '/client/sign_ups';

  id: string | undefined;
  private _status: SignUpStatus | null = null;
  requiredFields: SignUpField[] = [];
  missingFields: SignUpField[] = [];
  optionalFields: SignUpField[] = [];
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
  locale: string | null = null;

  /**
   * The current status of the sign-up process.
   *
   * @returns The current sign-up status, or null if no status has been set
   */
  get status(): SignUpStatus | null {
    return this._status;
  }

  /**
   * Sets the sign-up status and logs the transition at debug level.
   *
   * @param value - The new status to set. Can be null to clear the status.
   * @remarks When setting a new status that differs from the previous one,
   * a debug log entry is created showing the transition from the old to new status.
   */
  set status(value: SignUpStatus | null) {
    const previousStatus = this._status;
    this._status = value;

    if (value && previousStatus !== value) {
      debugLogger.debug('SignUp.status', { id: this.id, from: previousStatus, to: value });
    }
  }

  /**
   * @experimental This experimental API is subject to change.
   *
   * An instance of `SignUpFuture`, which has a different API than `SignUp`, intended to be used in custom flows.
   */
  __internal_future: SignUpFuture = new SignUpFuture(this);

  /**
   * @internal Only used for internal purposes, and is not intended to be used directly.
   *
   * This property is used to provide access to underlying Client methods to `SignUpFuture`, which wraps an instance
   * of `SignUp`.
   */
  __internal_basePost = this._basePost.bind(this);

  /**
   * @internal Only used for internal purposes, and is not intended to be used directly.
   *
   * This property is used to provide access to underlying Client methods to `SignUpFuture`, which wraps an instance
   * of `SignUp`.
   */
  __internal_basePatch = this._basePatch.bind(this);

  constructor(data: SignUpJSON | SignUpJSONSnapshot | null = null) {
    super();
    this.fromJSON(data);
  }

  create = async (params: SignUpCreateParams): Promise<SignUpResource> => {
    debugLogger.debug('SignUp.create', { id: this.id, strategy: params.strategy });

    let finalParams = { ...params };

    // Inject browser locale if not already provided
    if (!finalParams.locale) {
      const browserLocale = getBrowserLocale();
      if (browserLocale) {
        finalParams.locale = browserLocale;
      }
    }

    if (!__BUILD_DISABLE_RHC__ && !this.clientBypass() && !this.shouldBypassCaptchaForAttempt(params)) {
      const captchaChallenge = new CaptchaChallenge(SignUp.clerk);
      const captchaParams = await captchaChallenge.managedOrInvisible({ action: 'signup' });
      if (!captchaParams) {
        throw new ClerkRuntimeError('', { code: 'captcha_unavailable' });
      }
      finalParams = { ...finalParams, ...captchaParams };
    }

    if (finalParams.transfer && this.shouldBypassCaptchaForAttempt(finalParams)) {
      const strategy = SignUp.clerk.client?.signIn.firstFactorVerification.strategy;
      if (strategy) {
        finalParams = { ...finalParams, strategy: strategy as SignUpCreateParams['strategy'] };
      }
    }

    return this._basePost({
      path: this.pathRoot,
      body: normalizeUnsafeMetadata(finalParams),
    });
  };

  prepareVerification = (params: PrepareVerificationParams): Promise<this> => {
    debugLogger.debug('SignUp.prepareVerification', { id: this.id, strategy: params.strategy });
    return this._basePost({
      body: params,
      action: 'prepare_verification',
    });
  };

  attemptVerification = (params: AttemptVerificationParams): Promise<SignUpResource> => {
    debugLogger.debug('SignUp.attemptVerification', { id: this.id, strategy: params.strategy });
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

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
    const identifier = await web3().getMetamaskIdentifier();
    return this.authenticateWithWeb3({
      identifier,
      generateSignature: web3().generateSignatureWithMetamask,
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
    const identifier = await web3().getCoinbaseWalletIdentifier();
    return this.authenticateWithWeb3({
      identifier,
      generateSignature: web3().generateSignatureWithCoinbaseWallet,
      unsafeMetadata: params?.unsafeMetadata,
      strategy: 'web3_coinbase_wallet_signature',
      legalAccepted: params?.legalAccepted,
    });
  };

  public authenticateWithBase = async (
    params?: SignUpAuthenticateWithWeb3Params & {
      legalAccepted?: boolean;
    },
  ): Promise<SignUpResource> => {
    const identifier = await web3().getBaseIdentifier();
    return this.authenticateWithWeb3({
      identifier,
      generateSignature: web3().generateSignatureWithBase,
      unsafeMetadata: params?.unsafeMetadata,
      strategy: 'web3_base_signature',
      legalAccepted: params?.legalAccepted,
    });
  };

  public authenticateWithOKXWallet = async (
    params?: SignUpAuthenticateWithWeb3Params & {
      legalAccepted?: boolean;
    },
  ): Promise<SignUpResource> => {
    const identifier = await web3().getOKXWalletIdentifier();
    return this.authenticateWithWeb3({
      identifier,
      generateSignature: web3().generateSignatureWithOKXWallet,
      unsafeMetadata: params?.unsafeMetadata,
      strategy: 'web3_okx_wallet_signature',
      legalAccepted: params?.legalAccepted,
    });
  };

  private authenticateWithRedirectOrPopup = async (
    params: AuthenticateWithRedirectParams & {
      unsafeMetadata?: SignUpUnsafeMetadata;
    },
    navigateCallback: (url: URL | string) => void,
  ): Promise<void> => {
    const {
      redirectUrl,
      redirectUrlComplete,
      strategy,
      continueSignUp = false,
      unsafeMetadata,
      emailAddress,
      legalAccepted,
      oidcPrompt,
      enterpriseConnectionId,
    } = params;

    const redirectUrlWithAuthToken = SignUp.clerk.buildUrlWithAuth(redirectUrl);

    const authenticateFn = () => {
      const authParams = {
        strategy,
        redirectUrl: redirectUrlWithAuthToken,
        actionCompleteRedirectUrl: redirectUrlComplete,
        unsafeMetadata,
        emailAddress,
        legalAccepted,
        oidcPrompt,
        enterpriseConnectionId,
      };
      return continueSignUp && this.id ? this.update(authParams) : this.create(authParams);
    };

    const { verifications } = await authenticateFn().catch(async e => {
      // If captcha verification failed because the environment has changed, we need
      // to reload the environment and try again one more time with the new environment.
      // If this fails again, we will let the caller handle the error accordingly.
      if (isClerkAPIResponseError(e) && isCaptchaError(e)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await SignUp.clerk.__unstable__environment!.reload();
        return authenticateFn();
      }
      throw e;
    });

    const { externalAccount } = verifications;
    const { status, externalVerificationRedirectURL } = externalAccount;

    if (status === 'unverified' && !!externalVerificationRedirectURL) {
      navigateCallback(externalVerificationRedirectURL);
    } else {
      clerkInvalidFAPIResponse(status, SignUp.fapiClient.buildEmailAddress('support'));
    }
  };

  public authenticateWithRedirect = async (
    params: AuthenticateWithRedirectParams & {
      unsafeMetadata?: SignUpUnsafeMetadata;
    },
  ): Promise<void> => {
    return this.authenticateWithRedirectOrPopup(params, windowNavigate);
  };

  public authenticateWithPopup = async (
    params: AuthenticateWithPopupParams & {
      unsafeMetadata?: SignUpUnsafeMetadata;
    },
  ): Promise<void> => {
    const { popup } = params || {};
    if (!popup) {
      clerkMissingOptionError('popup');
    }

    return _authenticateWithPopup(SignUp.clerk, 'signUp', this.authenticateWithRedirectOrPopup, params, url => {
      popup.location.href = url instanceof URL ? url.toString() : url;
    });
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
      return createValidatePassword(loadZxcvbn(), {
        ...SignUp.clerk.__unstable__environment?.userSettings.passwordSettings,
        validatePassword: true,
      })(password, cb);
    }
  };

  protected fromJSON(data: SignUpJSON | SignUpJSONSnapshot | null): this {
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
      this.locale = data.locale;
    }

    eventBus.emit('resource:update', { resource: this });
    return this;
  }

  public __internal_toSnapshot(): SignUpJSONSnapshot {
    return {
      object: 'sign_up',
      id: this.id || '',
      status: this.status || null,
      required_fields: this.requiredFields,
      optional_fields: this.optionalFields,
      missing_fields: this.missingFields,
      unverified_fields: this.unverifiedFields,
      verifications: this.verifications.__internal_toSnapshot(),
      username: this.username,
      first_name: this.firstName,
      last_name: this.lastName,
      email_address: this.emailAddress,
      phone_number: this.phoneNumber,
      has_password: this.hasPassword,
      unsafe_metadata: this.unsafeMetadata,
      created_session_id: this.createdSessionId,
      created_user_id: this.createdUserId,
      abandon_at: this.abandonAt,
      web3_wallet: this.web3wallet,
      legal_accepted_at: this.legalAcceptedAt,
      locale: this.locale,
      external_account: this.externalAccount,
      external_account_strategy: this.externalAccount?.strategy,
    };
  }

  private clientBypass() {
    return SignUp.clerk.client?.captchaBypass;
  }

  /**
   * We delegate bot detection to the following providers, instead of relying on turnstile exclusively
   */
  protected shouldBypassCaptchaForAttempt(params: SignUpCreateParams) {
    if (!params.strategy) {
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const captchaOauthBypass = SignUp.clerk.__unstable__environment!.displayConfig.captchaOauthBypass;

    if (captchaOauthBypass.some(strategy => strategy === params.strategy)) {
      return true;
    }

    if (
      params.transfer &&
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      captchaOauthBypass.some(strategy => strategy === SignUp.clerk.client!.signIn.firstFactorVerification.strategy)
    ) {
      return true;
    }

    return false;
  }

  __experimental_getEnterpriseConnections = (): Promise<SignUpEnterpriseConnectionResource[]> => {
    return BaseResource._fetch({
      path: `/client/sign_ups/${this.id}/enterprise_connections`,
      method: 'GET',
    }).then(res => {
      const enterpriseConnections = res?.response as unknown as SignUpEnterpriseConnectionJSON[];

      return enterpriseConnections.map(enterpriseConnection => new SignUpEnterpriseConnection(enterpriseConnection));
    });
  };
}

class SignUpFuture implements SignUpFutureResource {
  verifications = {
    sendEmailCode: this.sendEmailCode.bind(this),
    verifyEmailCode: this.verifyEmailCode.bind(this),
    sendPhoneCode: this.sendPhoneCode.bind(this),
    verifyPhoneCode: this.verifyPhoneCode.bind(this),
  };

  #hasBeenFinalized = false;

  constructor(readonly resource: SignUp) {}

  get id() {
    return this.resource.id;
  }

  get requiredFields() {
    return this.resource.requiredFields;
  }

  get optionalFields() {
    return this.resource.optionalFields;
  }

  get missingFields() {
    return this.resource.missingFields;
  }

  get status() {
    // @TODO hooks-revamp: Consolidate this fallback val with stateProxy
    return this.resource.status || 'missing_requirements';
  }

  get username() {
    return this.resource.username;
  }

  get firstName() {
    return this.resource.firstName;
  }

  get lastName() {
    return this.resource.lastName;
  }

  get emailAddress() {
    return this.resource.emailAddress;
  }

  get phoneNumber() {
    return this.resource.phoneNumber;
  }

  get web3Wallet() {
    return this.resource.web3wallet;
  }

  get hasPassword() {
    return this.resource.hasPassword;
  }

  get unsafeMetadata() {
    return this.resource.unsafeMetadata;
  }

  get createdSessionId() {
    return this.resource.createdSessionId;
  }

  get createdUserId() {
    return this.resource.createdUserId;
  }

  get abandonAt() {
    return this.resource.abandonAt;
  }

  get legalAcceptedAt() {
    return this.resource.legalAcceptedAt;
  }

  get locale() {
    return this.resource.locale;
  }

  get unverifiedFields() {
    return this.resource.unverifiedFields;
  }

  get isTransferable() {
    // TODO: we can likely remove the error code check as the status should be sufficient
    return (
      this.resource.verifications.externalAccount.status === 'transferable' &&
      this.resource.verifications.externalAccount.error?.code === 'external_account_exists'
    );
  }

  get existingSession() {
    if (
      (this.resource.verifications.externalAccount.status === 'failed' ||
        this.resource.verifications.externalAccount.status === 'unverified') &&
      this.resource.verifications.externalAccount.error?.code === 'identifier_already_signed_in' &&
      this.resource.verifications.externalAccount.error?.meta?.sessionId
    ) {
      return { sessionId: this.resource.verifications.externalAccount.error?.meta?.sessionId };
    }

    return undefined;
  }

  get hasBeenFinalized() {
    return this.#hasBeenFinalized;
  }

  private async getCaptchaToken(): Promise<{
    captchaToken?: string;
    captchaWidgetType?: CaptchaWidgetType;
    captchaError?: unknown;
  }> {
    const captchaChallenge = new CaptchaChallenge(SignUp.clerk);
    const response = await captchaChallenge.managedOrInvisible({ action: 'signup' });
    if (!response) {
      throw new Error('Captcha challenge failed');
    }

    const { captchaError, captchaToken, captchaWidgetType } = response;
    return { captchaToken, captchaWidgetType, captchaError };
  }

  private async _create(params: SignUpFutureCreateParams): Promise<void> {
    const { captchaToken, captchaWidgetType, captchaError } = await this.getCaptchaToken();

    const body: Record<string, unknown> = {
      transfer: params.transfer,
      captchaToken,
      captchaWidgetType,
      captchaError,
      ...params,
      unsafeMetadata: params.unsafeMetadata ? normalizeUnsafeMetadata(params.unsafeMetadata) : undefined,
      locale: params.locale ?? getBrowserLocale(),
    };

    await this.resource.__internal_basePost({ path: this.resource.pathRoot, body });
  }

  async create(params: SignUpFutureCreateParams): Promise<{ error: ClerkError | null }> {
    return runAsyncResourceTask(this.resource, async () => {
      await this._create(params);
    });
  }

  async update(params: SignUpFutureUpdateParams): Promise<{ error: ClerkError | null }> {
    return runAsyncResourceTask(this.resource, async () => {
      const body: Record<string, unknown> = {
        ...params,
        unsafeMetadata: params.unsafeMetadata ? normalizeUnsafeMetadata(params.unsafeMetadata) : undefined,
      };

      await this.resource.__internal_basePatch({ path: this.resource.pathRoot, body });
    });
  }

  async password(params: SignUpFuturePasswordParams): Promise<{ error: ClerkError | null }> {
    return runAsyncResourceTask(this.resource, async () => {
      const { captchaToken, captchaWidgetType, captchaError } = await this.getCaptchaToken();

      const body: Record<string, unknown> = {
        strategy: 'password',
        captchaToken,
        captchaWidgetType,
        captchaError,
        ...params,
        unsafeMetadata: params.unsafeMetadata ? normalizeUnsafeMetadata(params.unsafeMetadata) : undefined,
      };

      await this.resource.__internal_basePost({ path: this.resource.pathRoot, body });
    });
  }

  async sendEmailCode(): Promise<{ error: ClerkError | null }> {
    return runAsyncResourceTask(this.resource, async () => {
      await this.resource.__internal_basePost({
        body: { strategy: 'email_code' },
        action: 'prepare_verification',
      });
    });
  }

  async verifyEmailCode(params: SignUpFutureEmailCodeVerifyParams): Promise<{ error: ClerkError | null }> {
    const { code } = params;
    return runAsyncResourceTask(this.resource, async () => {
      await this.resource.__internal_basePost({
        body: { strategy: 'email_code', code },
        action: 'attempt_verification',
      });
    });
  }

  async sendPhoneCode(params: SignUpFuturePhoneCodeSendParams): Promise<{ error: ClerkError | null }> {
    const { phoneNumber, channel = 'sms' } = params;
    return runAsyncResourceTask(this.resource, async () => {
      if (!this.resource.id) {
        const { captchaToken, captchaWidgetType, captchaError } = await this.getCaptchaToken();
        await this.resource.__internal_basePost({
          path: this.resource.pathRoot,
          body: { phoneNumber, captchaToken, captchaWidgetType, captchaError },
        });
      }

      await this.resource.__internal_basePost({
        body: { strategy: 'phone_code', channel },
        action: 'prepare_verification',
      });
    });
  }

  async verifyPhoneCode(params: SignUpFuturePhoneCodeVerifyParams): Promise<{ error: ClerkError | null }> {
    const { code } = params;
    return runAsyncResourceTask(this.resource, async () => {
      await this.resource.__internal_basePost({
        body: { strategy: 'phone_code', code },
        action: 'attempt_verification',
      });
    });
  }

  async sso(params: SignUpFutureSSOParams): Promise<{ error: ClerkError | null }> {
    const {
      strategy,
      redirectUrl,
      redirectCallbackUrl,
      unsafeMetadata,
      legalAccepted,
      oidcPrompt,
      enterpriseConnectionId,
      emailAddress,
      popup,
    } = params;
    return runAsyncResourceTask(this.resource, async () => {
      const { captchaToken, captchaWidgetType, captchaError } = await this.getCaptchaToken();

      let redirectUrlComplete = redirectUrl;
      try {
        new URL(redirectUrl);
      } catch {
        redirectUrlComplete = window.location.origin + redirectUrl;
      }

      const routes = {
        redirectUrl: SignUp.clerk.buildUrlWithAuth(redirectCallbackUrl),
        actionCompleteRedirectUrl: redirectUrlComplete,
      };
      if (popup) {
        const wrappedRoutes = wrapWithPopupRoutes(SignUp.clerk, {
          redirectCallbackUrl: routes.redirectUrl,
          redirectUrl: redirectUrlComplete,
        });
        routes.redirectUrl = wrappedRoutes.redirectCallbackUrl;
        routes.actionCompleteRedirectUrl = wrappedRoutes.redirectUrl;
      }

      const authenticateFn = () => {
        return this.resource.__internal_basePost({
          path: this.resource.pathRoot,
          body: {
            strategy,
            ...routes,
            unsafeMetadata,
            legalAccepted,
            oidcPrompt,
            enterpriseConnectionId,
            emailAddress,
            captchaToken,
            captchaWidgetType,
            captchaError,
          },
        });
      };

      await authenticateFn().catch(async e => {
        if (isClerkAPIResponseError(e) && isCaptchaError(e)) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          await SignUp.clerk.__unstable__environment!.reload();
          return authenticateFn();
        }
        throw e;
      });

      const { status, externalVerificationRedirectURL } = this.resource.verifications.externalAccount;

      if (status === 'unverified' && externalVerificationRedirectURL) {
        if (popup) {
          await _futureAuthenticateWithPopup(SignUp.clerk, { popup, externalVerificationRedirectURL });
          // Pick up the modified SignUp resource
          await this.resource.reload();
        } else {
          windowNavigate(externalVerificationRedirectURL);
        }
      }
    });
  }

  async web3(params: SignUpFutureWeb3Params): Promise<{ error: ClerkError | null }> {
    const { strategy, unsafeMetadata, legalAccepted } = params;
    const provider = strategy.replace('web3_', '').replace('_signature', '') as Web3Provider;

    return runAsyncResourceTask(this.resource, async () => {
      let identifier;
      let generateSignature;
      switch (provider) {
        case 'metamask':
          identifier = await web3().getMetamaskIdentifier();
          generateSignature = web3().generateSignatureWithMetamask;
          break;
        case 'coinbase_wallet':
          identifier = await web3().getCoinbaseWalletIdentifier();
          generateSignature = web3().generateSignatureWithCoinbaseWallet;
          break;
        case 'base':
          identifier = await web3().getBaseIdentifier();
          generateSignature = web3().generateSignatureWithBase;
          break;
        case 'okx_wallet':
          identifier = await web3().getOKXWalletIdentifier();
          generateSignature = web3().generateSignatureWithOKXWallet;
          break;
        default:
          throw new Error(`Unsupported Web3 provider: ${provider}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const web3Wallet = identifier || this.resource.web3wallet!;
      await this._create({ web3Wallet, unsafeMetadata, legalAccepted });
      await this.resource.__internal_basePost({
        body: { strategy },
        action: 'prepare_verification',
      });

      const { message } = this.resource.verifications.web3Wallet;
      if (!message) {
        clerkVerifyWeb3WalletCalledBeforeCreate('SignUp');
      }

      let signature: string;
      try {
        signature = await generateSignature({ identifier, nonce: message });
      } catch (err) {
        // There is a chance that as a first time visitor when you try to setup and use the
        // Coinbase Wallet from scratch in order to authenticate, the initial generate
        // signature request to be rejected. For this reason we retry the request once more
        // in order for the flow to be able to be completed successfully.
        //
        // error code 4001 means the user rejected the request
        // Reference: https://docs.cdp.coinbase.com/wallet-sdk/docs/errors
        if (provider === 'coinbase_wallet' && err.code === 4001) {
          signature = await generateSignature({ identifier, nonce: message });
        } else {
          throw err;
        }
      }

      await this.resource.__internal_basePost({
        body: { signature, strategy },
        action: 'attempt_verification',
      });
    });
  }

  async ticket(params?: SignUpFutureTicketParams): Promise<{ error: ClerkError | null }> {
    const ticket = params?.ticket ?? getClerkQueryParam('__clerk_ticket');
    return this.create({ ...params, ticket: ticket ?? undefined });
  }

  async finalize(params?: SignUpFutureFinalizeParams): Promise<{ error: ClerkError | null }> {
    const { navigate } = params || {};
    return runAsyncResourceTask(this.resource, async () => {
      if (!this.resource.createdSessionId) {
        throw new Error('Cannot finalize sign-up without a created session.');
      }

      this.#hasBeenFinalized = true;
      await SignUp.clerk.setActive({ session: this.resource.createdSessionId, navigate });
    });
  }
}

class SignUpEnterpriseConnection extends BaseResource implements SignUpEnterpriseConnectionResource {
  id!: string;
  name!: string;

  constructor(data: SignUpEnterpriseConnectionJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: SignUpEnterpriseConnectionJSON | null): this {
    if (data) {
      this.id = data.id;
      this.name = data.name;
    }

    return this;
  }
}
