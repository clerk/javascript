export const isPasswordConfirmationError = (error: { code: string } | undefined): boolean =>
  error?.code === 'form_password_incorrect' || error?.code === 'form_password_validation_failed';

export const PASSWORD_CONFIRMATION_SESSION_ENDED_PARAM = '__clerk_password_confirmation_session_ended';
export const PASSWORD_CONFIRMATION_NOTICE_TTL = 5 * 60 * 1000;

export const isPasswordConfirmationNotice = (value: unknown, publishableKey: string): value is string => {
  if (typeof value !== 'string' || !value.startsWith(`${publishableKey}:`)) {
    return false;
  }
  const issuedAt = Number(value.slice(publishableKey.length + 1));
  const age = Date.now() - issuedAt;
  return Number.isFinite(issuedAt) && age >= 0 && age < PASSWORD_CONFIRMATION_NOTICE_TTL;
};
