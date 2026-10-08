import { withRedirectToAfterSignUp } from '@/ui/common';
import { withCardStateProvider } from '@/ui/elements/contexts';

import { useSignUpEnterpriseConnectionsModel } from './sign-up-enterprise-connections.model';
import { SignUpEnterpriseConnectionsView } from './sign-up-enterprise-connections.view';

const SignUpEnterpriseConnectionsInternal = () => {
  const model = useSignUpEnterpriseConnectionsModel();
  return (
    <SignUpEnterpriseConnectionsView
      enterpriseConnections={model.enterpriseConnections}
      isLoading={model.isLoading}
      authenticate={model.authenticate}
    />
  );
};

/**
 * @experimental
 */
export const SignUpEnterpriseConnections = withRedirectToAfterSignUp(
  withCardStateProvider(SignUpEnterpriseConnectionsInternal),
);
