import { ChooseEnterpriseConnectionCard } from '@/ui/common/ChooseEnterpriseConnectionCard';
import { Flow, localizationKeys } from '@/ui/customizables';
import { LoadingCard } from '@/ui/elements/LoadingCard';

import type { useSignUpEnterpriseConnectionsModel } from './sign-up-enterprise-connections.model';

export const SignUpEnterpriseConnectionsView = ({
  enterpriseConnections,
  isLoading,
  authenticate,
}: Pick<
  ReturnType<typeof useSignUpEnterpriseConnectionsModel>,
  'enterpriseConnections' | 'isLoading' | 'authenticate'
>) => {
  if (!isLoading && !enterpriseConnections?.length) {
    return null;
  }

  return (
    <Flow.Part part='enterpriseConnections'>
      {enterpriseConnections?.length ? (
        <ChooseEnterpriseConnectionCard
          title={localizationKeys('signUp.enterpriseConnections.title')}
          subtitle={localizationKeys('signUp.enterpriseConnections.subtitle')}
          onClick={authenticate}
          enterpriseConnections={enterpriseConnections}
        />
      ) : isLoading ? (
        <LoadingCard />
      ) : null}
    </Flow.Part>
  );
};
