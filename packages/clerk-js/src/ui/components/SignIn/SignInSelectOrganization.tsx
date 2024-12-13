import { OrganizationListContext, useSignInContext } from '../../contexts';
import { Flow } from '../../customizables';
import { withCardStateProvider } from '../../elements';
import { OrganizationList } from '../OrganizationList';

const _SignInSelectOrganization = () => {
  const { afterSignInUrl } = useSignInContext();
  return (
    <Flow.Part part='selectOrganization'>
      <OrganizationListContext.Provider
        value={{
          componentName: 'OrganizationList',
          hidePersonal: true,
          skipInvitationScreen: false,
          afterCreateOrganizationUrl: afterSignInUrl,
          afterSelectOrganizationUrl: afterSignInUrl,
        }}
      >
        <OrganizationList />
      </OrganizationListContext.Provider>
    </Flow.Part>
  );
};
export const SignInSelectOrganization = withCardStateProvider(_SignInSelectOrganization);
