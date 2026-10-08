import { useUnsafeNavbarContext } from '@/ui/elements/Navbar';

import { useOrganizationAPIKeysPageModel } from './organization-api-keys-page.model';
import { OrganizationAPIKeysPageView } from './organization-api-keys-page.view';

export const OrganizationAPIKeysPage = () => {
  const model = useOrganizationAPIKeysPageModel();
  const { contentRef } = useUnsafeNavbarContext();

  if (!model.subject) {
    // We should never reach this point, but we'll return null to make TS happy
    return null;
  }

  return <OrganizationAPIKeysPageView data={{ ...model, subject: model.subject, revokeModalRoot: contentRef }} />;
};
