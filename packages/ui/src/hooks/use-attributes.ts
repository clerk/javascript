import { useClerk } from '@clerk/clerk-react';
import type { Attribute, AttributeData, EnvironmentResource } from '@clerk/types';

export function useAttributes(attribute: Attribute): AttributeData {
  const clerk = useClerk();
  const userSettingsAttributes = ((clerk as any)?.__unstable__environment as EnvironmentResource)?.userSettings
    .attributes;
  return userSettingsAttributes[attribute];
}
