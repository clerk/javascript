import { useState } from 'react';

import type { FlowDirection } from '../../../components/flow';
import type { SecurityPanelModel } from './organization-profile-security-panel.model';

export type SecurityPanelPage = 'overview' | 'ssoBypass';

export interface SecurityPanelController {
  page: SecurityPanelPage;
  direction: FlowDirection;
  onManageSSOBypass: (() => void) | undefined;
  onBack: () => void;
}

export function useSecurityPanelController(model: SecurityPanelModel): SecurityPanelController {
  const [requested, setRequested] = useState<SecurityPanelPage>('overview');
  const page: SecurityPanelPage = requested === 'ssoBypass' && !model.ssoBypass ? 'overview' : requested;

  return {
    page,
    direction: page === 'overview' ? -1 : 1,
    onManageSSOBypass: model.ssoBypass ? () => setRequested('ssoBypass') : undefined,
    onBack: () => setRequested('overview'),
  };
}
