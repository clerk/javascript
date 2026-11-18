import type { ReactNode } from 'react';

import { Panel } from '../../../components/panel';
import { useMessages } from '../../../localization';
import { themeProps } from '../../../props';
import type { SecurityPanelController } from './organization-profile-security-panel.controller';
import { SSOBypassDialog } from './sso-bypass.dialog';

export interface OrganizationProfileSecurityPanelViewProps extends SecurityPanelController {
  overview: ReactNode;
  ssoBypass: ReactNode;
}

export function OrganizationProfileSecurityPanelView({
  isSSOBypassOpen,
  onSSOBypassOpenChange,
  manageSSOBypassRef,
  overview,
  ssoBypass,
}: OrganizationProfileSecurityPanelViewProps) {
  const m = useMessages('organizationProfile');
  return (
    <Panel.Root render={<div {...themeProps('organization-profile-security-panel')} />}>
      <Panel.Title>{m.pages.security}</Panel.Title>
      <Panel.Sections>{overview}</Panel.Sections>
      <SSOBypassDialog
        open={isSSOBypassOpen}
        onOpenChange={onSSOBypassOpenChange}
        finalFocus={manageSSOBypassRef}
      >
        {ssoBypass}
      </SSOBypassDialog>
    </Panel.Root>
  );
}
