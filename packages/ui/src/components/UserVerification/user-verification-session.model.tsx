import { useSession } from '@clerk/shared/react';
import type { SessionVerificationLevel, SessionVerificationResource } from '@clerk/shared/types';
import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { useUserVerification } from '../../contexts';
import type { State } from '../../hooks/useFetch';
import { useUVRequestScopeModel } from './uv-request-scope.model';

type VerificationState = State<SessionVerificationResource, Error>;
type VerificationSession = VerificationState & {
  setCache: (value: VerificationState) => void;
  revalidate: () => void;
};
const VerificationSessionContext = createContext<VerificationSession | null>(null);
const initialState = (): VerificationState => ({ data: null, error: null, isLoading: true, isValidating: true });

export const useUserVerificationSessionKey = () => {
  const { level } = useUserVerification();
  return useMemo(() => ({ level: level || 'second_factor' }) satisfies { level: SessionVerificationLevel }, [level]);
};

const VerificationSessionOwner = ({ children }: PropsWithChildren) => {
  const { session } = useSession();
  const key = useUserVerificationSessionKey();
  const scope = useUVRequestScopeModel(JSON.stringify(['verification-session', key.level]));
  const { requestKey, canRun, run } = scope;
  const [snapshot, setSnapshot] = useState(() => ({ key: requestKey, value: initialState() }));
  const [refresh, setRefresh] = useState(0);
  const currentSession = useRef(session);
  currentSession.current = session;
  const pending = useRef<{ timer?: ReturnType<typeof setTimeout> }>();
  const cancelPending = useCallback(() => {
    if (pending.current?.timer !== undefined) {
      clearTimeout(pending.current.timer);
    }
    pending.current = undefined;
  }, []);
  const setCache = useCallback(
    (value: VerificationState) => {
      if (!canRun()) {
        return;
      }
      cancelPending();
      setSnapshot({ key: requestKey, value });
    },
    [canRun, cancelPending, requestKey],
  );
  const revalidate = useCallback(() => {
    if (canRun()) {
      cancelPending();
      setRefresh(value => value + 1);
    }
  }, [canRun, cancelPending]);

  useEffect(() => {
    const session = currentSession.current;
    if (!session || !canRun()) {
      return;
    }
    let active = true;
    const request: { timer?: ReturnType<typeof setTimeout> } = {};
    pending.current = request;
    const isCurrent = () => active && pending.current === request && canRun();
    queueMicrotask(() => {
      if (!isCurrent()) {
        return;
      }
      setSnapshot(previous => ({
        key: requestKey,
        value: {
          data: previous.key === requestKey ? previous.value.data : null,
          error: null,
          isLoading: previous.key !== requestKey || !previous.value.data,
          isValidating: true,
        },
      }));
      const startedAt = performance.now();
      void run(() => session.startVerification(key))
        .then(response => {
          if (!response || !isCurrent()) {
            return;
          }
          request.timer = setTimeout(
            () => {
              if (isCurrent()) {
                pending.current = undefined;
                setSnapshot({
                  key: requestKey,
                  value: { data: response, error: null, isLoading: false, isValidating: false, cachedAt: Date.now() },
                });
              }
            },
            Math.max(0, 300 - (performance.now() - startedAt)),
          );
        })
        .catch((error: Error) => {
          if (isCurrent()) {
            pending.current = undefined;
            setSnapshot(previous => ({
              key: requestKey,
              value: {
                data: previous.key === requestKey ? previous.value.data : null,
                error,
                isLoading: false,
                isValidating: false,
                cachedAt: Date.now(),
              },
            }));
          }
        });
    });
    return () => {
      active = false;
      if (pending.current === request) {
        cancelPending();
      }
    };
  }, [key, requestKey, canRun, run, refresh, cancelPending]);

  const state = snapshot.key === requestKey ? snapshot.value : initialState();
  const value = useMemo(() => ({ ...state, setCache, revalidate }), [state, setCache, revalidate]);
  return <VerificationSessionContext.Provider value={value}>{children}</VerificationSessionContext.Provider>;
};

export const UserVerificationSessionProvider = ({ children }: PropsWithChildren) => {
  const existing = useContext(VerificationSessionContext);
  return existing ? <>{children}</> : <VerificationSessionOwner>{children}</VerificationSessionOwner>;
};

export const useUserVerificationSession = () => {
  const value = useContext(VerificationSessionContext);
  if (!value) {
    throw new Error('Clerk: User verification session requires UserVerificationSessionProvider.');
  }
  return value;
};
