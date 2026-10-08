import type { AuthenticateWithPasskeyParams } from '@clerk/shared/types';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

type PasskeyCommands = {
  requestKey: string;
  canRun: () => boolean;
  authenticateWithPasskey: (params?: AuthenticateWithPasskeyParams) => Promise<void>;
  autofillAllowed?: boolean;
  checkAutofillSupport?: () => Promise<boolean>;
};

export const useSignInPasskeyController = (model: PasskeyCommands) => {
  const card = useCardState();
  const latest = useRef({ model, card });
  latest.current = { model, card };
  const mounted = useRef(true);
  const scope = useRef({ key: model.requestKey, version: 0 });
  if (scope.current.key !== model.requestKey) {
    scope.current = { key: model.requestKey, version: scope.current.version + 1 };
  }
  const version = scope.current.version;
  const pending = useRef<{ autofill?: object; explicit?: object }>({});
  const explicitStarted = useRef<number>();
  const [support, setSupport] = useState<{ version: number; supported: boolean }>();
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pending.current = {};
    };
  }, [model.requestKey]);
  const isCurrent = useCallback(
    () => mounted.current && scope.current.version === version && latest.current.model.canRun(),
    [version],
  );
  const authenticateWithPasskey = useCallback(
    async (params?: AuthenticateWithPasskeyParams) => {
      const lane = params?.flow === 'autofill' ? 'autofill' : 'explicit';
      if (!isCurrent() || pending.current[lane]) {
        return;
      }
      if (lane === 'explicit') {
        explicitStarted.current = version;
      }
      const request = {};
      pending.current[lane] = request;
      try {
        await latest.current.model.authenticateWithPasskey(params);
      } catch (error) {
        if (isCurrent() && pending.current[lane] === request) {
          handleError(error as Error, [], latest.current.card.setError);
        }
      } finally {
        if (pending.current[lane] === request) {
          delete pending.current[lane];
        }
      }
    },
    [isCurrent, version],
  );
  useEffect(() => {
    if (!model.autofillAllowed || !latest.current.model.checkAutofillSupport) {
      return;
    }
    let active = true;
    const run = async () => {
      let supported: boolean | undefined;
      try {
        supported = await latest.current.model.checkAutofillSupport?.();
      } catch (error) {
        if (active && isCurrent()) {
          handleError(error as Error, [], latest.current.card.setError);
        }
        return;
      }
      if (!active || !isCurrent()) {
        return;
      }
      setSupport({ version, supported: !!supported });
      if (supported && explicitStarted.current !== version) {
        await authenticateWithPasskey({ flow: 'autofill' });
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [model.autofillAllowed, version, isCurrent, authenticateWithPasskey]);
  return {
    authenticateWithPasskey,
    isWebAuthnAutofillSupported: !!model.autofillAllowed && support?.version === version && support.supported,
  };
};
