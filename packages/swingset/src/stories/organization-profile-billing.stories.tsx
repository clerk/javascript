/** @jsxImportSource @emotion/react */
import { OrganizationProfileBilling } from '@clerk/ui/mosaic/panels/organization-profile-billing';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Panels',
  title: 'OrganizationProfileBilling',
  label: 'Org Profile Billing',
  source: 'packages/ui/src/mosaic/panels/organization-profile-billing.tsx',
};

export function Default() {
  return <OrganizationProfileBilling />;
}
