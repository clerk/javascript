import type { SSOConnection, SSOConnectionCommands } from '../../ConfigureSSO/configure-sso.types';
import { isOidcProvider } from '../../ConfigureSSO/domain/organizationEnterpriseConnection';
import { providerLabel, toProviderCard } from '../../ConfigureSSO/domain/providers';
import { useOrganizationEnterpriseConnectionStatus } from '../../ConfigureSSO/hooks/useOrganizationEnterpriseConnectionStatus';
import type { EnterpriseConnectionProviderType } from '../../ConfigureSSO/types';
import { STATUS_BADGES } from '../enterpriseConnectionStatusBadges';

export type EnterpriseConnectionPageProps = {
  connection: SSOConnection;
  enterpriseConnectionMutations: SSOConnectionCommands;
  onBack: () => void;
};

export const useEnterpriseConnectionPageModel = ({ connection }: EnterpriseConnectionPageProps) => {
  const { status } = useOrganizationEnterpriseConnectionStatus(connection);
  return {
    isOidc: isOidcProvider(connection.provider),
    name: connection.name,
    label: providerLabel(toProviderCard(connection.provider as EnterpriseConnectionProviderType)),
    badge: STATUS_BADGES[status],
  };
};
