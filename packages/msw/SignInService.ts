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
      identifier?: string;
      status?: 'needs_first_factor' | 'complete';
      verificationAttempts?: number;
      verificationStatus?: 'unverified' | 'verified';
    } = {},
  ) {
    const {
      createdSessionId = null,
      identifier = this.currentIdentifier,
      status = 'needs_first_factor',
      verificationAttempts = 0,
      verificationStatus = 'unverified',
    } = options;

    const signInResponse = {
      abandon_at: null,
      created_session_id: createdSessionId,
      first_factor_verification: {
        attempts: verificationAttempts,
        error: null,
        expire_at: Date.now() + 600000,
        status: verificationStatus,
        strategy: 'password',
        supported_strategies: ['password'],
      },
      id: 'si_mock_signin_id',
      identifier,
      object: 'sign_in',
      second_factor_verification: null,
      status,
      supported_first_factors: [
        {
          email_address_id: 'idn_mock_email',
          primary: true,
          safe_identifier: identifier,
          strategy: 'password',
        },
      ],
      supported_identifiers: ['email_address'],
      supported_second_factors: [],
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
}
