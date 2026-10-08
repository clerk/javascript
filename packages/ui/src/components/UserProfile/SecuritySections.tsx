import type { ReactNode } from 'react';

import {
  useSecurityDeleteModel,
  useSecurityMfaModel,
  useSecurityPasskeysModel,
  useSecurityPasswordModel,
} from './security-sections.model';
import {
  SecurityDeleteView,
  SecurityMfaView,
  SecurityPasskeysView,
  SecurityPasswordView,
} from './security-sections.view';

export function SecurityPassword(): ReactNode {
  const model = useSecurityPasswordModel();
  if (!model.available) {
    return null;
  }
  return <SecurityPasswordView />;
}

export function SecurityPasskeys(): ReactNode {
  const model = useSecurityPasskeysModel();
  if (!model.available) {
    return null;
  }
  return <SecurityPasskeysView />;
}

export function SecurityMfa(): ReactNode {
  const model = useSecurityMfaModel();
  if (!model.available) {
    return null;
  }
  return <SecurityMfaView />;
}

export function SecurityDelete(): ReactNode {
  const model = useSecurityDeleteModel();
  if (!model.available) {
    return null;
  }
  return <SecurityDeleteView />;
}
