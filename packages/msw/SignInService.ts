import type { SessionResource } from '@clerk/shared/types';

import { SessionService } from './SessionService';
import { UserService } from './UserService';

export class SignInService {
  private static currentSignIn: any = null;
  private static currentIdentifier: string = 'user@example.com';

  static reset() {
    this.currentSignIn = null;
    this.currentIdentifier = 'user@example.com';
  }

  static setIdentifier(identifier: string) {
    this.currentIdentifier = identifier;
  }

  static getIdentifier() {
    return this.currentIdentifier;
  }

  static getCurrentSignIn() {
    return this.currentSignIn;
  }

  static clearSignIn() {
    this.currentSignIn = null;
  }

  static createSignInResponse(
    options: {
      createdSessionId?: string | null;
      firstFactorStrategy?: 'password' | 'email_code' | 'phone_code';
      identifier?: string;
      status?: 'needs_first_factor' | 'needs_second_factor' | 'complete';
      supportedSecondFactors?: Array<{ strategy: string }>;
      verificationAttempts?: number;
      verificationStatus?: 'unverified' | 'verified';
    } = {},
  ) {
    const {
      createdSessionId = null,
      firstFactorStrategy = 'password',
      identifier = this.currentIdentifier,
      status = 'needs_first_factor',
      supportedSecondFactors = [],
      verificationAttempts = 0,
      verificationStatus = 'unverified',
    } = options;

    const isSecondFactor = status === 'needs_second_factor';

    const supportedFirstFactors = this.buildSupportedFirstFactors(firstFactorStrategy, identifier);

    const secondFactorVerification = isSecondFactor
      ? {
          attempts: 0,
          error: null,
          expire_at: Date.now() + 600000,
          status: 'unverified',
          strategy: supportedSecondFactors[0]?.strategy ?? 'totp',
          supported_strategies: supportedSecondFactors.map(f => f.strategy),
        }
      : null;

    const signInResponse = {
      abandon_at: null,
      created_session_id: createdSessionId,
      first_factor_verification: {
        attempts: verificationAttempts,
        error: null,
        expire_at: Date.now() + 600000,
        status: isSecondFactor ? 'verified' : verificationStatus,
        strategy: firstFactorStrategy,
        supported_strategies: [firstFactorStrategy],
      },
      id: 'si_mock_signin_id',
      identifier,
      object: 'sign_in',
      second_factor_verification: secondFactorVerification,
      status,
      supported_first_factors: supportedFirstFactors,
      supported_identifiers: ['email_address'],
      supported_second_factors: supportedSecondFactors.map(f => ({
        ...f,
        phone_number_id: f.strategy === 'phone_code' ? 'idn_mock_phone' : undefined,
      })),
      user_data: null,
    };

    this.currentSignIn = signInResponse;
    return signInResponse;
  }

  static createUser(currentSession: SessionResource | null) {
    const newUserId = 'user_mock_signed_in';
    const newSessionId = 'sess_mock_signed_in';

    const newUser = UserService.create();
    newUser.id = newUserId;
    newUser.primaryEmailAddress = UserService.createEmailAddress({
      emailAddress: this.currentIdentifier,
      id: 'email_signed_in_user',
      verification: {
        attempts: null,
        expireAt: null,
        status: 'verified',
        strategy: 'ticket',
      } as any,
    });
    newUser.emailAddresses = [newUser.primaryEmailAddress];
    newUser.primaryEmailAddressId = newUser.primaryEmailAddress.id;

    const newSession = UserService.createSession(newUserId, { id: newSessionId });

    const signInResponse = this.createSignInResponse({
      createdSessionId: newSessionId,
      status: 'complete',
      verificationAttempts: 1,
      verificationStatus: 'verified',
    });

    const clientState = SessionService.getClientState(currentSession);
    clientState.response.sign_in = signInResponse as any;
    clientState.response.sessions.push(newSession as any);
    clientState.response.last_active_session_id = newSessionId;

    this.clearSignIn();

    return {
      clientState,
      newSession,
      newUser,
      signInResponse,
    };
  }

  private static buildSupportedFirstFactors(strategy: string, identifier: string) {
    switch (strategy) {
      case 'email_code':
        return [
          {
            email_address_id: 'idn_mock_email',
            primary: true,
            safe_identifier: identifier,
            strategy: 'email_code',
          },
        ];
      case 'phone_code':
        return [
          {
            phone_number_id: 'idn_mock_phone',
            primary: true,
            safe_identifier: '+1********00',
            strategy: 'phone_code',
          },
        ];
      case 'password':
      default:
        return [
          {
            email_address_id: 'idn_mock_email',
            primary: true,
            safe_identifier: identifier,
            strategy: 'password',
          },
        ];
    }
  }
}
