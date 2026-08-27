export interface ReverificationPasswordFactor {
  stage: 'first';
  strategy: 'password';
}

export interface ReverificationEmailCodeFactor {
  stage: 'first';
  strategy: 'email_code';
  emailAddressId: string;
  safeIdentifier: string;
}

export interface ReverificationFirstFactorPhoneCodeFactor {
  stage: 'first';
  strategy: 'phone_code';
  phoneNumberId: string;
  safeIdentifier: string;
}

export interface ReverificationPasskeyFactor {
  stage: 'first';
  strategy: 'passkey';
}

export interface ReverificationSecondFactorPhoneCodeFactor {
  stage: 'second';
  strategy: 'phone_code';
  phoneNumberId: string;
  safeIdentifier: string;
}

export interface ReverificationTOTPFactor {
  stage: 'second';
  strategy: 'totp';
}

export interface ReverificationBackupCodeFactor {
  stage: 'second';
  strategy: 'backup_code';
}

export type ReverificationFirstFactor =
  | ReverificationPasswordFactor
  | ReverificationEmailCodeFactor
  | ReverificationFirstFactorPhoneCodeFactor
  | ReverificationPasskeyFactor;

export type ReverificationSecondFactor =
  | ReverificationSecondFactorPhoneCodeFactor
  | ReverificationTOTPFactor
  | ReverificationBackupCodeFactor;

export type ReverificationFactor = ReverificationFirstFactor | ReverificationSecondFactor;

export type ReverificationChallenge =
  | {
      status: 'needs_first_factor';
      factors: ReverificationFirstFactor[];
      initialFactor?: ReverificationFirstFactor;
    }
  | {
      status: 'needs_second_factor';
      factors: ReverificationSecondFactor[];
      initialFactor?: ReverificationSecondFactor;
    };

export type ReverificationPreparationFactor = Extract<ReverificationFactor, { strategy: 'email_code' | 'phone_code' }>;

export type ReverificationAttempt =
  | { factor: ReverificationPasswordFactor; password: string }
  | {
      factor: Exclude<ReverificationFactor, ReverificationPasswordFactor | ReverificationPasskeyFactor>;
      code: string;
    }
  | { factor: ReverificationPasskeyFactor };

export interface ReverificationCompleteResult {
  status: 'complete';
  sessionId: string;
}

export interface ReverificationError {
  /** Whether the failure belongs to the submitted answer or to the flow as a whole. */
  scope: 'answer' | 'flow';
  message: string;
}

export type ReverificationAttemptResult =
  | ReverificationCompleteResult
  | {
      status: 'needs_second_factor';
      factors: ReverificationSecondFactor[];
      initialFactor?: ReverificationSecondFactor;
    };
