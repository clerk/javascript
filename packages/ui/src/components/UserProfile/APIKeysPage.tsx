import { useUnsafeNavbarContext } from '@/ui/elements/Navbar';

import { useUserAPIKeysPageModel } from './api-keys-page.model';
import { UserAPIKeysPageView } from './api-keys-page.view';

export const APIKeysPage = () => {
  const model = useUserAPIKeysPageModel();
  const { contentRef } = useUnsafeNavbarContext();

  if (!model.subject) {
    // We should never reach this point, but we'll return null to make TS happy
    return null;
  }

  return <UserAPIKeysPageView data={{ ...model, subject: model.subject, revokeModalRoot: contentRef }} />;
};
