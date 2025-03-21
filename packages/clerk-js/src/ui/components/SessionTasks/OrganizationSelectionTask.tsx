import { OrganizationListContext } from '../../contexts';
import { OrganizationList } from '../OrganizationList';

/**
 * @internal
 */
export function OrganizationSelectionTask() {
  return (
    <OrganizationListContext.Provider
      value={{
        componentName: 'OrganizationList',
        skipInvitationScreen: true,
      }}
    >
      <OrganizationList />
    </OrganizationListContext.Provider>
  );
}
