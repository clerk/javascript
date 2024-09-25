import type { Attribute, AttributeData } from '@clerk/types';

import { useAppearance } from '~/contexts';

import { useEnvironment } from './use-environment';

export function useAttributes(attribute: Attribute): AttributeData {
  const environment = useEnvironment();
  const userSettingsAttributes = environment.userSettings.attributes;

  return userSettingsAttributes[attribute];
}

type SignUpAttributeData = AttributeData & {
  /**
   * Should the field be visible to the user durning sign up flow.
   */
  show: boolean;
};

/**
 * Custom attributes for sign up flow that includes whether or not a field should be shown
 * based on enabled/required and showOptionalFields layout prop.
 */
export function useSignUpAttributes(attribute: Attribute): SignUpAttributeData {
  const attr = useAttributes(attribute);
  const { options } = useAppearance().parsedAppearance;
  const { showOptionalFields } = options;

  return {
    ...attr,
    show: (showOptionalFields || attr.required) && attr.enabled,
  };
}
