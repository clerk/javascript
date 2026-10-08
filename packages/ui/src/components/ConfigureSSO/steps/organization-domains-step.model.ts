import { useClerk, useOrganization } from '@clerk/shared/react';
import { eventFlowStepMounted } from '@clerk/shared/telemetry';
import { useEffect, useRef } from 'react';

import { localizationKeys, useLocalizations } from '@/customizables';

import type { SSODomain } from '../configure-sso.types';
import { useConfigureSSO } from '../ConfigureSSOContext';
import { areConnectionDomainsReady } from '../domain/organizationEnterpriseConnection';

export const useOrganizationDomainsStepModel = () => {
  const { t } = useLocalizations();
  const {
    ownerKey,
    canRun,
    enterpriseConnection,
    connectionDomains,
    setConnectionDomains,
    claimedDomains,
    organizationDomains,
    organizationEnterpriseConnection,
    contentRef,
    organizationDomainMutations: { createDomain, removeDomain: deleteDomain, prepareOwnershipVerification },
  } = useConfigureSSO();
  const clerk = useClerk();
  const { organization } = useOrganization();
  const scopeKey = JSON.stringify([ownerKey, enterpriseConnection?.id]);
  const scope = useRef({ key: scopeKey, version: 0 });
  if (scope.current.key !== scopeKey) {
    scope.current = { key: scopeKey, version: scope.current.version + 1 };
  }
  const version = scope.current.version;
  const mounted = useRef(true);
  const currentContext = { connectionDomains, setConnectionDomains, deleteDomain, prepareOwnershipVerification };
  const removalContext = useRef<typeof currentContext | null>(currentContext);
  removalContext.current = currentContext;
  const isCurrent = () => mounted.current && scope.current.version === version && canRun();

  useEffect(() => {
    mounted.current = true;
    removalContext.current = { connectionDomains, setConnectionDomains, deleteDomain, prepareOwnershipVerification };
    return () => {
      mounted.current = false;
      removalContext.current = null;
    };
  }, [connectionDomains, setConnectionDomains, deleteDomain, prepareOwnershipVerification]);

  const hasRecordedTelemetryEvent = useRef(false);
  useEffect(() => {
    if (hasRecordedTelemetryEvent.current) {
      return;
    }

    hasRecordedTelemetryEvent.current = true;
    clerk.telemetry?.record(
      eventFlowStepMounted('configureSSO', 'verify-domain', {
        timestamp: new Date().toISOString(),
        connectionStatus: organizationEnterpriseConnection.status,
        connectionId: enterpriseConnection?.id ?? null,
        organizationId: organization?.id ?? null,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDomain = async (domainName: string, checked: boolean) => {
    const current = removalContext.current;
    if (!isCurrent() || !current) {
      return;
    }
    const domains = checked
      ? [...current.connectionDomains, domainName]
      : current.connectionDomains.filter(name => name !== domainName);
    await current.setConnectionDomains(domains);
  };

  const prepareDomainOwnershipVerification = async (id: string) => {
    if (isCurrent()) {
      await removalContext.current?.prepareOwnershipVerification([id]);
    }
  };

  const removeDomain = async (domain: SSODomain) => {
    const current = removalContext.current;
    if (!isCurrent() || !current) {
      return;
    }
    try {
      if (current.connectionDomains.includes(domain.name)) {
        await current.setConnectionDomains(current.connectionDomains.filter(name => name !== domain.name));
      }
      if (isCurrent()) {
        await removalContext.current?.deleteDomain(domain.id);
      }
    } catch (error) {
      if (isCurrent()) {
        throw error;
      }
    }
  };

  const domainsReady = areConnectionDomainsReady(connectionDomains, organizationDomains, claimedDomains);

  // An existing connection must keep at least one domain, so its last one can
  // be neither deselected nor removed.
  const lockLastConnectionDomain = Boolean(enterpriseConnection) && connectionDomains.length === 1;
  const lastConnectionDomainTooltip = enterpriseConnection?.active
    ? localizationKeys('configureSSO.organizationDomainsStep.domainCard.removeButtonTooltip__lastVerifiedDomainActive')
    : localizationKeys('configureSSO.organizationDomainsStep.domainCard.removeButtonTooltip__lastVerifiedDomain');

  return {
    scopeKey,
    canRun: isCurrent,
    organizationDomains,
    domainNames: organizationDomains?.map(domain => domain.name) ?? [],
    claimedDomains,
    connectionDomains,
    contentRef,
    domainsReady,
    lockLastConnectionDomain,
    lastConnectionDomainTooltip,
    isConnectionActive: Boolean(enterpriseConnection?.active),
    title: t(localizationKeys('configureSSO.organizationDomainsStep.title')),
    subtitle: t(localizationKeys('configureSSO.organizationDomainsStep.subtitle')),
    createDomain,
    toggleDomain,
    prepareDomainOwnershipVerification,
    removeDomain,
  };
};
