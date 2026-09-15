import { __internal_useOrganizationEnterpriseConnectionTestRuns } from '@clerk/shared/react';
import type { EnterpriseConnectionResource } from '@clerk/shared/types';

import {
  isEnterpriseConnectionConfigured,
  type OrganizationEnterpriseConnection,
  organizationEnterpriseConnection,
} from '../domain/organizationEnterpriseConnection';

/** Same probe and query key as the umbrella hook, so react-query dedupes it for the scoped connection. */
export const useOrganizationEnterpriseConnectionStatus = (
  connection: EnterpriseConnectionResource,
): OrganizationEnterpriseConnection => {
  const { data: successfulTestRuns } = __internal_useOrganizationEnterpriseConnectionTestRuns({
    enterpriseConnectionId: connection.id,
    params: { initialPage: 1, pageSize: 1, status: ['success'] },
    enabled: isEnterpriseConnectionConfigured(connection) && !connection.active,
  });

  return organizationEnterpriseConnection({
    connection,
    hasSuccessfulTestRun: (successfulTestRuns?.length ?? 0) > 0,
  });
};
