export const isPasswordConfirmationError = (error: { code: string } | undefined): boolean =>
  error?.code === 'form_password_incorrect' || error?.code === 'form_password_validation_failed';
