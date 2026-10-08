import type React from 'react';

import type { SSOConnection, SSOConnectionCommands } from '../ConfigureSSO/configure-sso.types';
import type { ConnectionScope } from '../ConfigureSSO/domain/connectionScope';

export type SecuritySsoSectionProps = {
  ownerKey: string;
  canRun: () => boolean;
  enterpriseConnections: SSOConnection[];
  enterpriseConnectionMutations: SSOConnectionCommands;
  organizationName: string;
  contentRef: React.RefObject<HTMLDivElement>;
  onConfigure?: (scope: ConnectionScope, forceInitialStep?: boolean) => void;
  onOpenConnection?: (id: string) => void;
};

export type ConnectionRowProps = Omit<SecuritySsoSectionProps, 'enterpriseConnections'> & {
  connection: SSOConnection;
};
