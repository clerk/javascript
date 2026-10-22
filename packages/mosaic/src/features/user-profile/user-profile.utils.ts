import type { AttributeData } from '@clerk/shared/types';

export function isAttributeAvailable(
  attribute: Pick<AttributeData, 'enabled' | 'used_for_first_factor' | 'used_for_second_factor'> | undefined,
): boolean {
  return Boolean(attribute?.enabled || attribute?.used_for_first_factor || attribute?.used_for_second_factor);
}
