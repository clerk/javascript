import type { SSOConnection } from '../../ConfigureSSO/configure-sso.types';

export const useDomainsSectionModel = (connection: SSOConnection) => ({
  domains: connection.domains,
});
