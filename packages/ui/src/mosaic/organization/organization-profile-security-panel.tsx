import type { ReactElement } from 'react';

import { useOrganizationProfileSecurityPanelController } from './organization-profile-security-panel.controller';
import { OrganizationProfileSecurityPanelView } from './organization-profile-security-panel.view';

/**
 * The Mosaic Enterprise SSO Security panel. Self-gating: renders nothing until the
 * controller reports `ready` (org/session/environment resolved and the feature flag +
 * `org:sys_entconns:manage` permission gate passes). The shell decides whether the
 * Security *tab* renders at all, but the panel stays self-gating as defense in depth.
 */
export function OrganizationProfileSecurityPanel(): ReactElement | null {
  const controller = useOrganizationProfileSecurityPanelController();
  if (controller.status !== 'ready') {
    return null;
  }
  return (
    <OrganizationProfileSecurityPanelView
      mode={controller.mode}
      isLoading={controller.isLoading}
      organizationName={controller.organizationName}
      connection={controller.connection}
      enterpriseConnection={controller.enterpriseConnection}
      openWizard={controller.openWizard}
      exitWizard={controller.exitWizard}
      overview={controller.overview}
      wizard={controller.wizard}
      domainsStep={controller.domainsStep}
    />
  );
}
