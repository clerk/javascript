import type { AttributeData } from '@clerk/shared/types';

export function isAttributeAvailable(attribute: AttributeData | undefined): boolean {
  return Boolean(attribute?.enabled || attribute?.used_for_first_factor || attribute?.used_for_second_factor);
}
