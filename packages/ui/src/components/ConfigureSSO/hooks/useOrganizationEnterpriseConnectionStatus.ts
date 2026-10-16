import { __internal_useOrganizationEnterpriseConnectionTestRuns } from '@clerk/shared/react';
import type { EnterpriseConnectionResource } from '@clerk/shared/types';

import {
  isEnterpriseConnectionConfigured,
  type OrganizationEnterpriseConnection,
  organizationEnterpriseConnection,
} from '../domain/organizationEnterpriseConnection';

type StatusOptions = {
  /** Lists pass false to skip the per-connection test-runs request; a configured, inactive connection then reads `inactive`. */
  probe?: boolean;
};

/** Same probe and query key as the umbrella hook, so react-query dedupes it for the scoped connection. */
export const useOrganizationEnterpriseConnectionStatus = (
  connection: EnterpriseConnectionResource,
  { probe = true }: StatusOptions = {},
): OrganizationEnterpriseConnection => {
  const isConfigured = isEnterpriseConnectionConfigured(connection);

  const { data: successfulTestRuns } = __internal_useOrganizationEnterpriseConnectionTestRuns({
    enterpriseConnectionId: connection.id,
    params: { initialPage: 1, pageSize: 1, status: ['success'] },
    enabled: probe && isConfigured && !connection.active,
  });

  return organizationEnterpriseConnection({
    connection,
    hasSuccessfulTestRun: probe ? (successfulTestRuns?.length ?? 0) > 0 : isConfigured,
  });
};
