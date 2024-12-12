import { OrganizationListContext } from '../../contexts';
import { Flow } from '../../customizables';
import { withCardStateProvider } from '../../elements';
import { OrganizationList } from '../OrganizationList';

const _SignInSelectOrganization = () => {
  return (
    <Flow.Part part='select-org'>
      <OrganizationListContext.Provider value={{ componentName: 'OrganizationList', hidePersonal: true }}>
        <OrganizationList />
      </OrganizationListContext.Provider>
    </Flow.Part>
  );
};
export const SignInSelectOrganization = withCardStateProvider(_SignInSelectOrganization);
