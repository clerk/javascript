/** One name attribute as the instance configures it. Supplied from `userSettings.attributes.first_name` and `last_name`. */
export interface UserProfileNameAttribute {
  /** @default true */
  enabled?: boolean;
  /** @default false */
  required?: boolean;
}

export interface UserProfileContact {
  id: string;
  value: string;
  isDefault: boolean;
  isVerified: boolean;
}

export type UserProfileEmail = UserProfileContact;

export type UserProfilePhone = UserProfileContact;

export interface UserProfileEmailVerification {
  method: 'code';
  sent: Promise<void>;
}

export interface UserProfileEmailVerifier {
  start: () => UserProfileEmailVerification;
  verifyCode: (code: string) => Promise<void>;
}
