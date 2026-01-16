import type { VerificationStrategy } from '@clerk/shared/types';

export const MFA_METHODS_TO_ROUTES_PATH: Record<Partial<VerificationStrategy>, string> = {
  totp: 'totp',
  phone_code: 'phone-code',
};
