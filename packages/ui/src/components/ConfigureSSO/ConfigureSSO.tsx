import type { ConfigureSSOProps } from '@clerk/shared/types';
import React from 'react';

import { withCoreUserGuard } from '@/contexts';
import { withCardStateProvider } from '@/elements/contexts';

import { useConfigureSSOContentModel, useConfigureSSOProtectModel } from './configure-sso.model';
import {
  ConfigureSSOAuthenticatedView,
  ConfigureSSOContentView,
  ConfigureSSOProtectView,
  ConfigureSSOView,
} from './configure-sso.view';
import { ConfigureSSOWizard } from './ConfigureSSOWizard';

const ConfigureSSOInternal = () => {
  return (
    <ConfigureSSOView>
      <AuthenticatedContent />
    </ConfigureSSOView>
  );
};

const AuthenticatedContent = withCoreUserGuard(() => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  return (
    <ConfigureSSOAuthenticatedView contentRef={contentRef}>
      <ConfigureSSOContent contentRef={contentRef} />
    </ConfigureSSOAuthenticatedView>
  );
});

export const ConfigureSSOContent = ({ contentRef }: { contentRef: React.RefObject<HTMLDivElement> }) => {
  const model = useConfigureSSOContentModel();
  return (
    <ConfigureSSOContentView isLoading={model.isLoading}>
      <ConfigureSSOProtect>
        <ConfigureSSOWizard
          key={model.ownerKey}
          ownerKey={model.ownerKey}
          canRun={model.canRun}
          organizationEnterpriseConnection={model.organizationEnterpriseConnection}
          testRuns={model.testRuns}
          enterpriseConnection={model.enterpriseConnection}
          connectionDomains={model.connectionDomains}
          setConnectionDomains={model.setConnectionDomains}
          claimedDomains={model.claimedDomains}
          contentRef={contentRef}
          enterpriseConnectionMutations={model.enterpriseConnectionMutations}
          organizationDomainMutations={model.organizationDomainMutations}
          organizationDomains={model.organizationDomains}
        />
      </ConfigureSSOProtect>
    </ConfigureSSOContentView>
  );
};

/** Permission gate shared by the wizard's hosts — personal workspaces pass, since there is no membership to check. */
export const ConfigureSSOProtect = ({ children }: { children: React.ReactNode }) => {
  const model = useConfigureSSOProtectModel();
  return (
    <ConfigureSSOProtectView canManageEnterpriseConnections={model.canManageEnterpriseConnections}>
      {children}
    </ConfigureSSOProtectView>
  );
};

export const ConfigureSSO: React.ComponentType<ConfigureSSOProps> = withCardStateProvider(ConfigureSSOInternal);
