import { useClerk } from '@clerk/shared/react';
import type { ResetPasswordCodeFactor, SignInStrategy } from '@clerk/types';

const resetPasswordStrategies: SignInStrategy[] = ['reset_password_phone_code', 'reset_password_email_code'];
export const isResetPasswordStrategy = (strategy: SignInStrategy | string | null | undefined) =>
  !!strategy && resetPasswordStrategies.includes(strategy as SignInStrategy);

export function useResetPasswordFactor() {
  const clerk = useClerk();

  return clerk.client.signIn.supportedFirstFactors?.find(({ strategy }) => isResetPasswordStrategy(strategy)) as
    | ResetPasswordCodeFactor
    | undefined;
}
