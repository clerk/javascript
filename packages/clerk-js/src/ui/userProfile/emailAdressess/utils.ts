import { EnvironmentResource } from '@clerk/types';

export function magicLinksEnabledForInstance(
  env: EnvironmentResource,
): boolean {
  // TODO: email verification should have a supported strategies field
  const { authConfig } = env;
  const { emailAddressVerificationStrategies } = authConfig;
  return emailAddressVerificationStrategies.includes('email_link');
}
