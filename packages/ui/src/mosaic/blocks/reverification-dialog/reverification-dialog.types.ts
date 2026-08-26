interface ReverificationFactorBase {
  id: string;
  label: string;
}

export interface ReverificationPasswordFactor extends ReverificationFactorBase {
  stage: 'first';
  strategy: 'password';
}

export interface ReverificationEmailCodeFactor extends ReverificationFactorBase {
  stage: 'first';
  strategy: 'email_code';
  emailAddressId: string;
  safeIdentifier: string;
}

export interface ReverificationFirstFactorPhoneCodeFactor extends ReverificationFactorBase {
  stage: 'first';
  strategy: 'phone_code';
  phoneNumberId: string;
  safeIdentifier: string;
}

export interface ReverificationPasskeyFactor extends ReverificationFactorBase {
  stage: 'first';
  strategy: 'passkey';
}

export interface ReverificationSecondFactorPhoneCodeFactor extends ReverificationFactorBase {
  stage: 'second';
  strategy: 'phone_code';
  phoneNumberId: string;
  safeIdentifier: string;
}

export interface ReverificationTOTPFactor extends ReverificationFactorBase {
  stage: 'second';
  strategy: 'totp';
}

export interface ReverificationBackupCodeFactor extends ReverificationFactorBase {
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
      initialFactorId?: string;
    }
  | {
      status: 'needs_second_factor';
      factors: ReverificationSecondFactor[];
      initialFactorId?: string;
    };

export type ReverificationPreparationFactor = Extract<ReverificationFactor, { strategy: 'email_code' | 'phone_code' }>;

export type ReverificationAttempt =
  | { factor: ReverificationPasswordFactor; password: string }
  | {
      factor: Exclude<ReverificationFactor, ReverificationPasswordFactor | ReverificationPasskeyFactor>;
      code: string;
    }
  | { factor: ReverificationPasskeyFactor };

export type ReverificationAttemptResult =
  | { status: 'complete' }
  | {
      status: 'needs_second_factor';
      factors: ReverificationSecondFactor[];
      initialFactorId?: string;
    };
