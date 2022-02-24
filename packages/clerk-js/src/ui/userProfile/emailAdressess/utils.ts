import { EnvironmentResource } from '@clerk/types';

export function magicLinksEnabledForInstance(
  env: EnvironmentResource,
): boolean {
  const { userSettings } = env;
  const { email_address } = userSettings.attributes;
  return (
    email_address.enabled && email_address.verifications.includes('email_link')
  );
}
