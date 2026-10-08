import { useEffect, useRef, useState } from 'react';

import { useCardState } from '@/elements/contexts';
import { handleError } from '@/utils/errorHandler';

import type { useOpenTestUrlButtonModel } from './open-test-url-button.model';

export const useOpenTestUrlButtonController = (
  model: ReturnType<typeof useOpenTestUrlButtonModel>,
  onTestRunCreated?: (testUrl: string) => void,
) => {
  const card = useCardState();
  const mounted = useRef(true);
  const scope = useRef({ key: model.scopeKey, version: 0 });
  if (scope.current.key !== model.scopeKey) {
    scope.current = { key: model.scopeKey, version: scope.current.version + 1 };
  }
  const version = scope.current.version;
  const pendingRequest = useRef<object | null>(null);
  const [pendingVersion, setPendingVersion] = useState<number>();
  const isCurrent = () => mounted.current && scope.current.version === version && model.canRun();

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pendingRequest.current = null;
    };
  }, [model.scopeKey]);

  const openTestRun = async () => {
    if (!model.connectionId || !isCurrent() || pendingRequest.current) {
      return;
    }
    const request = {};
    pendingRequest.current = request;
    setPendingVersion(version);
    card.setError(undefined);
    try {
      const url = await model.createTestRun();
      if (!url || !isCurrent() || pendingRequest.current !== request) {
        return;
      }
      onTestRunCreated?.(url);
      if (!isCurrent() || pendingRequest.current !== request) {
        return;
      }
      // `noopener,noreferrer` so the IdP can't reach back into the dashboard
      // via `window.opener` once it lands the SAML response.
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      if (isCurrent() && pendingRequest.current === request) {
        handleError(err as Error, [], card.setError);
      }
    } finally {
      if (pendingRequest.current === request) {
        pendingRequest.current = null;
        if (mounted.current && scope.current.version === version) {
          setPendingVersion(undefined);
        }
      }
    }
  };

  return { isCreatingTestRun: pendingVersion === version, openTestRun };
};
