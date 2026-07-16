import { useClerk } from '@clerk/shared/react';
import { useContext } from 'react';

import { isDevelopmentSDK } from '@/ui/utils/runtimeEnvironment';

import { PageContext } from './PageContext';

export function useRequirePage(componentName: string): boolean {
  const clerk = useClerk();
  const page = useContext(PageContext);
  if (!page) {
    if (isDevelopmentSDK(clerk)) {
      throw new Error(
        `<${componentName}> must be rendered inside a page component (e.g. <UserProfileAccountPanel>, <UserProfileSecurityPanel>, <OrganizationProfileGeneralPanel>).`,
      );
    }
    return false;
  }
  return true;
}
