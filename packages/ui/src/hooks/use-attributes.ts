import type { Attribute, AttributeData } from '@clerk/types';

import { useEnvironment } from './use-environment';

export function useAttributes(attribute: Attribute): AttributeData {
  const environment = useEnvironment();

  const userSettingsAttributes = environment.userSettings.attributes;

  return userSettingsAttributes[attribute];
}
