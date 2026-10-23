export interface UserProfileContact {
  id: string;
  value: string;
  isDefault: boolean;
  isVerified: boolean;
}

export type UserProfileEmail = UserProfileContact;

export type UserProfilePhone = UserProfileContact;

export type UserProfileEmailVerification =
  | { method: 'code' }
  | { method: 'link'; verified: Promise<void>; cancel: () => void }
  | { method: 'sso'; connect: () => Promise<void> };

export interface UserProfileEmailVerifier {
  prepare: () => Promise<UserProfileEmailVerification>;
  cancel: () => void;
  verifyCode: (code: string) => Promise<void>;
}

export interface UserProfilePhoneVerifier {
  sendCode: () => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
}
