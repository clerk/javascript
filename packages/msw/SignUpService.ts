import type { SessionResource, UserResource } from '@clerk/shared/types';

import { SessionService } from './SessionService';
import { UserService } from './UserService';

export class SignUpService {
  private static currentSignUp: any = null;
  private static currentEmail: string = 'user@example.com';
  private static currentFirstName: string | null = null;
  private static currentLastName: string | null = null;

  static reset() {
    this.currentSignUp = null;
    this.currentEmail = 'user@example.com';
    this.currentFirstName = null;
    this.currentLastName = null;
  }

  static setEmail(email: string) {
    this.currentEmail = email;
  }

  static setFirstName(firstName: string | null) {
    this.currentFirstName = firstName;
  }

  static setLastName(lastName: string | null) {
    this.currentLastName = lastName;
  }

  static getEmail() {
    return this.currentEmail;
  }

  static getFirstName() {
    return this.currentFirstName;
  }

  static getLastName() {
    return this.currentLastName;
  }

  static getCurrentSignUp() {
    return this.currentSignUp;
  }

  static clearSignUp() {
    this.currentSignUp = null;
  }

  static createSignUpResponse(
    options: {
      createdSessionId?: string | null;
      createdUserId?: string | null;
      email?: string;
      firstName?: string | null;
      lastName?: string | null;
      status?: 'missing_requirements' | 'complete';
      unverifiedFields?: string[];
      verificationAttempts?: number;
      verificationStatus?: 'unverified' | 'verified' | 'failed';
    } = {},
  ) {
    const {
      createdSessionId = null,
      createdUserId = null,
      email = this.currentEmail,
      firstName = this.currentFirstName,
      lastName = this.currentLastName,
      status = 'missing_requirements',
      unverifiedFields = ['email_address'],
      verificationAttempts = 0,
      verificationStatus = 'unverified',
    } = options;

    const signUpResponse = {
      abandoned: false,
      attempt_id: null,
      captcha_error: null,
      captcha_token: null,
      created_session_id: createdSessionId,
      created_user_id: createdUserId,
      email_address: email,
      external_account: null,
      external_account_strategy: null,
      external_account_verification: null,
      first_name: firstName,
      has_password: true,
      id: 'su_mock_signup_id',
      last_name: lastName,
      legal_accepted_at: null,
      missing_fields: [],
      object: 'sign_up',
      optional_fields: ['first_name', 'last_name'],
      passkey: null,
      phone_number: null,
      required_fields: [],
      status,
      supported_external_accounts: [],
      supported_first_factors: [],
      supported_second_factors: [],
      unverified_fields: unverifiedFields,
      unsafe_metadata: {},
      username: null,
      verifications: {
        email_address: {
          attempts: verificationAttempts,
          error: null,
          expire_at: Date.now() + 600000,
          next_action: verificationAttempts === 0 ? 'needs_attempt' : '',
          status: verificationStatus,
          strategy: 'email_code',
          supported_strategies: ['email_code'],
        },
      },
      web3_wallet: null,
    };

    this.currentSignUp = signUpResponse;
    return signUpResponse;
  }

  static createUser(currentSession: SessionResource | null) {
    const newUserId = 'user_mock_new_user';
    const newSessionId = 'sess_mock_new_session';

    const newUser = UserService.create();
    newUser.id = newUserId;
    newUser.firstName = this.currentFirstName || 'User';
    newUser.lastName = this.currentLastName || 'Mock';
    newUser.fullName = `${newUser.firstName} ${newUser.lastName}`.trim();
    newUser.primaryEmailAddress = UserService.createEmailAddress({
      emailAddress: this.currentEmail,
      id: 'email_new_user',
      verification: {
        attempts: null,
        expireAt: null,
        status: 'verified',
        strategy: 'email_code',
      } as any,
    });
    newUser.emailAddresses = [newUser.primaryEmailAddress];
    newUser.primaryEmailAddressId = newUser.primaryEmailAddress.id;

    const newSession = UserService.createSession(newUserId, { id: newSessionId });

    const signUpResponse = this.createSignUpResponse({
      createdSessionId: newSessionId,
      createdUserId: newUserId,
      status: 'complete',
      unverifiedFields: [],
      verificationAttempts: 1,
      verificationStatus: 'verified',
    });

    const clientState = SessionService.getClientState(currentSession);
    clientState.response.sign_up = signUpResponse as any;
    clientState.response.sessions.push(newSession as any);
    clientState.response.last_active_session_id = newSessionId;

    this.clearSignUp();

    return {
      clientState,
      newSession,
      newUser,
      signUpResponse,
    };
  }
}
