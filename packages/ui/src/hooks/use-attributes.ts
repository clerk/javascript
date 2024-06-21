import { useClerk } from '@clerk/clerk-react';
import type { Attribute, EnvironmentResource } from '@clerk/types';

export function useAttributes(attribute?: Attribute) {
  const clerk = useClerk();
  const attributes = ((clerk as any)?.__unstable__environment as EnvironmentResource)?.userSettings.attributes;
  return attribute ? attributes[attribute] : attributes;
}
