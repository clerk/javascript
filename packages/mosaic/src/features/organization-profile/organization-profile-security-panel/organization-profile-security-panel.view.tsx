import type { ReactNode } from 'react';

import { EmptyState } from '../../../components/empty-state';
import { Panel } from '../../../components/panel';
import { ShieldCheck } from '../../../icons/glyphs/shield-check';
import { useMessages } from '../../../localization';
import { themeProps } from '../../../props';

export interface OrganizationProfileSecurityPanelViewProps {
  children: ReactNode;
}

export function OrganizationProfileSecurityPanelView({ children }: OrganizationProfileSecurityPanelViewProps) {
  const m = useMessages('organizationProfile');
  return (
    <Panel.Root render={<div {...themeProps('organization-profile-security-panel')} />}>
      <Panel.Title>{m.pages.security}</Panel.Title>
      <Panel.Sections>{children}</Panel.Sections>
    </Panel.Root>
  );
}

export function OrganizationProfileSecurityPanelEmptyState() {
  const m = useMessages('organizationProfile').security.empty;
  return (
    <EmptyState.Root>
      <EmptyState.Icon glyph={ShieldCheck} />
      <EmptyState.Label>{m.label}</EmptyState.Label>
      <EmptyState.Description>{m.description}</EmptyState.Description>
    </EmptyState.Root>
  );
}
