import { useEffect, useRef, useState } from 'react';

import { useCardState } from '@/elements/contexts';
import { getFieldError, getGlobalError } from '@/utils/errorHandler';

import { useWizard } from '../elements/Wizard/WizardContext';
import type { useOrganizationDomainsStepModel } from './organization-domains-step.model';

type Model = Pick<
  ReturnType<typeof useOrganizationDomainsStepModel>,
  'scopeKey' | 'canRun' | 'createDomain' | 'toggleDomain' | 'prepareDomainOwnershipVerification'
>;
type DomainToRemove = { name: string; remove: () => Promise<void> };

export const useOrganizationDomainsStepController = (model: Model) => {
  const { goPrev, goNext, isFirstStep, isLastStep } = useWizard();
  const card = useCardState();
  const mounted = useRef(true);
  const scope = useRef({ key: model.scopeKey, version: 0 });
  if (scope.current.key !== model.scopeKey) {
    scope.current = { key: model.scopeKey, version: scope.current.version + 1 };
  }
  const version = scope.current.version;
  const pending = useRef(new Map<string, object>());
  const [updatingVersion, setUpdatingVersion] = useState<number>();
  const [removal, setRemoval] = useState<{ version: number; domain: DomainToRemove } | null>(null);
  const removalRef = useRef(removal);
  removalRef.current = removal;
  const isCurrent = () => mounted.current && scope.current.version === version && model.canRun();

  useEffect(() => {
    const requests = pending.current;
    mounted.current = true;
    return () => {
      mounted.current = false;
      requests.clear();
      removalRef.current = null;
    };
  }, [model.scopeKey]);

  const runRequest = async (key: string, operation: () => Promise<void>) => {
    if (!isCurrent() || pending.current.has(key)) {
      return;
    }
    const request = {};
    pending.current.set(key, request);
    if (key === 'selection') {
      setUpdatingVersion(version);
    }
    card.setError(undefined);
    try {
      await operation();
    } catch (err) {
      if (isCurrent() && pending.current.get(key) === request) {
        card.setError(getFieldError(err as Error) ?? getGlobalError(err as Error));
      }
    } finally {
      if (pending.current.get(key) === request) {
        pending.current.delete(key);
        if (mounted.current && scope.current.version === version && key === 'selection') {
          setUpdatingVersion(undefined);
        }
      }
    }
  };

  return {
    error: card.error,
    goPrev,
    goNext,
    isFirstStep,
    isLastStep,
    domainToRemove: removal?.version === version ? removal.domain : null,
    isUpdatingDomains: updatingVersion === version,
    handleCreateDomain: (name: string) => runRequest('create', () => model.createDomain(name)),
    handlePrepareOwnershipVerification: (id: string) =>
      runRequest(`verify:${id}`, () => model.prepareDomainOwnershipVerification(id)),
    handleToggleDomain: (name: string, checked: boolean) =>
      runRequest('selection', () => model.toggleDomain(name, checked)),
    selectDomainForRemoval: (domain: DomainToRemove) => {
      if (isCurrent()) {
        const next = { version, domain };
        removalRef.current = next;
        setRemoval(next);
      }
    },
    closeRemoveDialog: () => {
      if (isCurrent() && removalRef.current === removal) {
        removalRef.current = null;
        setRemoval(null);
      }
    },
  };
};
