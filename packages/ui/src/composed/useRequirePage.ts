import { useContext } from 'react';

import { PageContext } from './PageContext';

export function useRequirePage(componentName: string): boolean {
  const page = useContext(PageContext);
  if (!page) {
    if (typeof __DEV__ === 'undefined' || __DEV__) {
      throw new Error(
        `<${componentName}> must be rendered inside a page component (e.g. <UserProfileAccountPanel>, <UserProfileSecurityPanel>, <OrganizationProfileGeneralPanel>).`,
      );
    }
    return false;
  }
  return true;
}
