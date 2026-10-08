import { useClerk, useOrganization, useSafeLayoutEffect } from '@clerk/shared/react';
import { eventFlowStepMounted } from '@clerk/shared/telemetry';
import { useRef } from 'react';

import { useConfigureSSO } from '../ConfigureSSOContext';

export const useActivateStepModel = () => {
  const {
    ownerKey,
    canRun: canRunSource,
    enterpriseConnection,
    organizationEnterpriseConnection,
    enterpriseConnectionMutations: { setConnectionActive },
    onExit,
  } = useConfigureSSO();
  const clerk = useClerk();
  const { organization } = useOrganization();

  // The activate step is only reachable with a configured connection, so the
  // domains are set; join multiples for the subtitle copy.
  const domain = (enterpriseConnection?.domains ?? []).join(', ');

  const connectionId = enterpriseConnection?.id;
  const sourceKey = JSON.stringify([ownerKey, connectionId]);
  const current = useRef({ sourceKey, clerk, version: 0 });
  const changed = current.current.sourceKey !== sourceKey || current.current.clerk !== clerk;
  const version = current.current.version + (changed ? 1 : 0);
  current.current = { sourceKey, clerk, version };
  const latest = useRef({ setConnectionActive, onExit, organizationId: organization?.id });
  latest.current = { setConnectionActive, onExit, organizationId: organization?.id };
  const mounted = useRef(true);
  useSafeLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const canRun = () => mounted.current && current.current.version === version && canRunSource();
  const activate = async (canContinue = () => true): Promise<boolean> => {
    const isCurrent = () => canRun() && canContinue();
    if (!connectionId || !isCurrent()) {
      return false;
    }
    try {
      await latest.current.setConnectionActive(connectionId, true);
      if (!isCurrent()) {
        return false;
      }
      clerk.telemetry?.record(
        eventFlowStepMounted('configureSSO', 'activate', {
          timestamp: new Date().toISOString(),
          connectionStatus: 'active',
          connectionId,
          organizationId: latest.current.organizationId ?? null,
        }),
      );
      return true;
    } catch (error) {
      if (isCurrent()) {
        throw error;
      }
      return false;
    }
  };

  return {
    scopeKey: JSON.stringify([sourceKey, version]),
    canRun,
    domain,
    isActive: organizationEnterpriseConnection.isActive,
    hasConnection: Boolean(enterpriseConnection),
    activate,
    onExit: onExit
      ? () => {
          if (canRun()) {
            latest.current.onExit?.();
          }
        }
      : undefined,
  };
};
