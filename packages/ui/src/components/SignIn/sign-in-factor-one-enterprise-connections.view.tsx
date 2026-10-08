import { ChooseEnterpriseConnectionCard } from '@/ui/common/ChooseEnterpriseConnectionCard';
import { Flow, localizationKeys } from '@/ui/customizables';

import type { useSignInFactorOneEnterpriseConnectionsModel } from './sign-in-factor-one-enterprise-connections.model';

export const SignInFactorOneEnterpriseConnectionsView = ({
  hasEnterpriseConnections,
  enterpriseConnections,
  authenticate,
}: Pick<
  ReturnType<typeof useSignInFactorOneEnterpriseConnectionsModel>,
  'hasEnterpriseConnections' | 'enterpriseConnections' | 'authenticate'
>) => {
  if (!hasEnterpriseConnections) {
    return null;
  }

  return (
    <Flow.Part part='enterpriseConnections'>
      <ChooseEnterpriseConnectionCard
        title={localizationKeys('signIn.enterpriseConnections.title')}
        subtitle={localizationKeys('signIn.enterpriseConnections.subtitle')}
        onClick={authenticate}
        enterpriseConnections={enterpriseConnections}
      />
    </Flow.Part>
  );
};
