export const MFA_METHODS_TO_STEP: Record<Partial<'phone_code' | 'totp'>, number> = {
  phone_code: 1,
  totp: 2,
};
