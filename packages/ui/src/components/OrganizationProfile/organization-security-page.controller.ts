import { useEffect, useRef, useState } from 'react';

import type { ConnectionScope } from '../ConfigureSSO/domain/connectionScope';
import type { useOrganizationSecurityPageModel } from './organization-security-page.model';

type SecurityPageView =
  | { kind: 'overview' }
  | { kind: 'wizard'; forceInitialStep: boolean }
  | { kind: 'connection'; id: string }
  | { kind: 'directorySync' }
  | { kind: 'ssoBypass' };

export const useOrganizationSecurityPageController = (model: ReturnType<typeof useOrganizationSecurityPageModel>) => {
  const mounted = useRef(true);
  const owner = useRef({ key: model.ownerKey, version: 0 });
  const navigation = useRef(0);
  const accessKey = JSON.stringify([model.canManageConnections, model.showDirectorySync, model.showSSOBypass]);
  const access = useRef(accessKey);
  if (access.current !== accessKey) {
    access.current = accessKey;
    navigation.current++;
  }
  if (owner.current.key !== model.ownerKey) {
    owner.current = { key: model.ownerKey, version: owner.current.version + 1 };
    navigation.current++;
  }
  const ownerVersion = owner.current.version;
  const [requested, setRequested] = useState<{ ownerVersion: number; view: SecurityPageView }>({
    ownerVersion,
    view: { kind: 'overview' },
  });
  const requestedView: SecurityPageView =
    requested.ownerVersion === ownerVersion ? requested.view : { kind: 'overview' };
  const openedConnection =
    requestedView.kind === 'connection'
      ? model.enterpriseConnections.find(connection => connection.id === requestedView.id)
      : undefined;

  // A removed connection or unavailable page returns to the overview.
  const unavailable =
    ((requestedView.kind === 'wizard' || requestedView.kind === 'connection') && !model.canManageConnections) ||
    (requestedView.kind === 'connection' && !openedConnection) ||
    (requestedView.kind === 'directorySync' && !model.showDirectorySync) ||
    (requestedView.kind === 'ssoBypass' && !model.showSSOBypass);
  if (unavailable) {
    navigation.current++;
    setRequested({ ownerVersion, view: { kind: 'overview' } });
  }
  const view: SecurityPageView = unavailable ? { kind: 'overview' } : requestedView;
  const navigationVersion = navigation.current;
  const isCurrent = () =>
    mounted.current &&
    owner.current.version === ownerVersion &&
    navigation.current === navigationVersion &&
    model.canRun();

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const show = (next: SecurityPageView) => {
    if (!isCurrent()) {
      return;
    }
    navigation.current++;
    setRequested({ ownerVersion, view: next });
  };
  const openWizard = (scope: ConnectionScope, forceInitialStep = false) => {
    if (!isCurrent() || !model.canManageConnections) {
      return;
    }
    model.selectConnection(scope);
    show({ kind: 'wizard', forceInitialStep });
  };
  const openConnection = (id: string) => {
    if (model.canManageConnections && model.enterpriseConnections.some(connection => connection.id === id)) {
      show({ kind: 'connection', id });
    }
  };

  return {
    ...model,
    view,
    openedConnection,
    exitToOverview: () => show({ kind: 'overview' }),
    openWizard,
    openConnection,
    openSSOBypass: () => {
      if (model.showSSOBypass) {
        show({ kind: 'ssoBypass' });
      }
    },
    openDirectorySync: () => {
      if (model.showDirectorySync) {
        show({ kind: 'directorySync' });
      }
    },
  };
};
