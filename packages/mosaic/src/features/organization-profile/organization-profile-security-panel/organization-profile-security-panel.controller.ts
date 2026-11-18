import type { RefObject } from 'react';
import { useRef, useState } from 'react';

import type { SecurityPanelModel } from './organization-profile-security-panel.model';

export interface SecurityPanelController {
  isSSOBypassOpen: boolean;
  onSSOBypassOpenChange: (open: boolean) => void;
  onManageSSOBypass: (() => void) | undefined;
  manageSSOBypassRef: RefObject<HTMLButtonElement>;
}

export function useSecurityPanelController(model: SecurityPanelModel): SecurityPanelController {
  const [requested, setRequested] = useState(false);
  const manageSSOBypassRef = useRef<HTMLButtonElement>(null);

  return {
    isSSOBypassOpen: requested && Boolean(model.ssoBypass),
    onSSOBypassOpenChange: setRequested,
    onManageSSOBypass: model.ssoBypass ? () => setRequested(true) : undefined,
    manageSSOBypassRef,
  };
}
