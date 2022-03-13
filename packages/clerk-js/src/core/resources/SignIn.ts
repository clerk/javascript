import { deepCamelToSnake } from '@clerk/shared/utils/object';
import { Poller } from '@clerk/shared/utils/poller';
import type {
  AttemptFirstFactorParams,
  AttemptSecondFactorParams,
  AuthenticateWithRedirectParams,
  CreateMagicLinkFlowReturn,
  PrepareFirstFactorParams,
  PrepareSecondFactorParams,
  SignInCreateParams,
  SignInFirstFactor,
  SignInIdentifier,
  SignInJSON,
  SignInResource,
  SignInSecondFactor,
  SignInStartMagicLinkFlowParams,
  SignInStatus,
  UserData,
  VerificationResource,
  Web3SignatureFactor,
} from '@clerk/types';
import {
  clerkInvalidStrategy,
  clerkMissingOptionError,
  clerkVerifyEmailAddressCalledBeforeCreate,
  clerkVerifyWeb3WalletCalledBeforeCreate,
} from 'core/errors';
import { GenerateSignatureParams, generateSignatureWithMetamask, getMetamaskIdentifier, windowNavigate } from 'utils';

import { STRATEGY_WEB3_METAMASK_SIGNATURE } from '../constants';
import { BaseResource, Verification } from './internal';

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
  userData: UserData = {};

  constructor(data: SignInJSON | null = null) {
    super();
    this.fromJSON(data);
  }

  create = (params: SignInCreateParams): Promise<this> => {
    return this._basePost({
      path: this.pathRoot,
      body: deepCamelToSnake(params),
    });
  };

  prepareFirstFactor = (factor: PrepareFirstFactorParams): Promise<SignInResource> => {
    factor = deepCamelToSnake(factor);
    let params: {
      strategy: string;
      email_address_id?: string;
      phone_number_id?: string;
      web3_wallet_id?: string;
      redirect_url?: string;
    } = { strategy: factor.strategy };

    switch (factor.strategy) {
      case 'email_link':
        params = {
          ...params,
          email_address_id: factor.email_address_id,
          redirect_url: factor.redirect_url,
        };
        break;
      case 'email_code':
        params = { ...params, email_address_id: factor.email_address_id };
        break;
      case 'phone_code':
        params = { ...params, phone_number_id: factor.phone_number_id };
        break;
      case STRATEGY_WEB3_METAMASK_SIGNATURE:
        params = { ...params, web3_wallet_id: factor.web3_wallet_id };
        break;
      default:
        clerkInvalidStrategy('SignIn.prepareFirstFactor', factor.strategy);
    }

    return this._basePost({
      body: params,
      action: 'prepare_first_factor',
    });
  };

  attemptFirstFactor = (params: AttemptFirstFactorParams): Promise<SignInResource> => {
    params = deepCamelToSnake(params);
    return this._basePost({
      body: params,
      action: 'attempt_first_factor',
    });
  };

  createMagicLinkFlow = (): CreateMagicLinkFlowReturn<SignInStartMagicLinkFlowParams, SignInResource> => {
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
        email_address_id: emailAddressId,
        redirect_url: redirectUrl,
      });
      return new Promise((resolve, reject) => {
        void run(() => {
          return this._baseGet({ forceUpdateClient: true })
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

  prepareSecondFactor = (params: PrepareSecondFactorParams): Promise<SignInResource> => {
    params = deepCamelToSnake(params);
    return this._basePost({
      body: params,
      action: 'prepare_second_factor',
    });
  };

  attemptSecondFactor = (params: AttemptSecondFactorParams): Promise<SignInResource> => {
    params = deepCamelToSnake(params);
    return this._basePost({
      body: params,
      action: 'attempt_second_factor',
    });
  };

  public authenticateWithRedirect = async ({
    strategy,
    redirectUrl,
    redirectUrlComplete,
  }: AuthenticateWithRedirectParams): Promise<void> => {
    const { firstFactorVerification } = await this.create({
      strategy,
      redirect_url: redirectUrl,
      action_complete_redirect_url: redirectUrlComplete,
    });
    const { status, externalVerificationRedirectURL } = firstFactorVerification;

    if (status === 'unverified' && externalVerificationRedirectURL) {
      windowNavigate(externalVerificationRedirectURL);
    } else {
      const email = SignIn.fapiClient.buildEmailAddress('support');
      const message = `Response: ${status} not supported yet.\nFor more information contact us at ${email}`;
      alert(message);
    }
  };

  public authenticateWithWeb3 = async ({
    identifier,
    generateSignature,
  }: {
    identifier: string;
    generateSignature: (opts: GenerateSignatureParams) => Promise<string>;
  }): Promise<SignInResource> => {
    if (!(typeof generateSignature === 'function')) {
      clerkMissingOptionError('generateSignature');
    }

    await this.create({ identifier });

    const web3FirstFactor = this.supportedFirstFactors.find(
      f => f.strategy === STRATEGY_WEB3_METAMASK_SIGNATURE,
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
      strategy: STRATEGY_WEB3_METAMASK_SIGNATURE,
    });
  };

  public authenticateWithMetamask = async (): Promise<SignInResource> => {
    const identifier = await getMetamaskIdentifier();

    return this.authenticateWithWeb3({
      identifier,
      generateSignature: generateSignatureWithMetamask,
    });
  };

  protected fromJSON(data: SignInJSON | null): this {
    if (data) {
      this.id = data.id;
      this.status = data.status;
      this.supportedIdentifiers = data.supported_identifiers;
      this.identifier = data.identifier;
      this.supportedFirstFactors = data.supported_first_factors;
      this.supportedSecondFactors = data.supported_second_factors;
      this.firstFactorVerification = new Verification(data.first_factor_verification);
      this.secondFactorVerification = new Verification(data.second_factor_verification);
      this.createdSessionId = data.created_session_id;
      this.userData = data.user_data;
    }
    return this;
  }
}
