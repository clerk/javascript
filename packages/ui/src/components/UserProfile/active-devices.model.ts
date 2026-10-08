import { useClerk, useReverification, useSafeLayoutEffect, useSession, useUser } from '@clerk/shared/react';
import { useRef } from 'react';

import { useFetch } from '@/ui/hooks';

import type { ActiveDevicesModel } from './active-devices.types';

export const useActiveDevicesModel = (): ActiveDevicesModel => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const actor = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const identity = JSON.stringify([actor, sessionId, clientId]);
  const current = useRef({ identity, version: 0, clerk });
  if (current.current.identity !== identity || current.current.clerk !== clerk) {
    current.current = { identity, version: current.current.version + 1, clerk };
  }
  const owner = current.current;
  const scopeKey = JSON.stringify([identity, owner.version]);
  const mounted = useRef(true);
  const canRun = () =>
    mounted.current &&
    current.current === owner &&
    !!actor &&
    !!sessionId &&
    clerk.user?.id === actor &&
    clerk.session?.id === sessionId &&
    clerk.client?.id === clientId;
  const fetchSessions = async () => {
    const currentUser = clerk.user;
    return currentUser && canRun() ? currentUser.getSessions() : [];
  };
  const {
    data: sessions,
    isLoading,
    revalidate,
  } = useFetch(user && session ? fetchSessions : undefined, { scopeKey }, undefined, 'user-sessions');
  const latest = useRef<{ sessions: typeof sessions; revalidate: typeof revalidate }>();
  latest.current = { sessions, revalidate };
  useSafeLayoutEffect(() => {
    mounted.current = true;
    latest.current = { sessions, revalidate };
    return () => {
      mounted.current = false;
      latest.current = undefined;
    };
  }, []);
  const revokeSession = useReverification(async (target: string, isCurrent: () => boolean) => {
    if (!isCurrent() || clerk.session?.id === target) {
      return;
    }
    const resource = latest.current?.sessions?.find(candidate => candidate.id === target);
    if (!resource || (resource.status !== 'active' && resource.status !== 'pending')) {
      return;
    }
    await resource.revoke();
    if (isCurrent()) {
      latest.current?.revalidate();
    }
  });
  const visibleSessions =
    isLoading || !canRun()
      ? []
      : (sessions ?? []).filter(resource => resource.status === 'active' || resource.status === 'pending');
  const orderedSessions = [...visibleSessions].sort(
    (a, b) => Number(b.id === session?.id) - Number(a.id === session?.id),
  );

  return {
    scopeKey,
    isLoading: canRun() && isLoading,
    devices: orderedSessions.map(resource => {
      const id = resource.id;
      const { city, country, browserName, browserVersion, deviceType, ipAddress, isMobile } = resource.latestActivity;
      return {
        id,
        scopeKey,
        canRun,
        isCurrent: session?.id === id,
        isCurrentlyImpersonating: !!session?.actor,
        isImpersonationSession: !!resource.actor,
        title: deviceType || (isMobile ? 'Mobile device' : 'Desktop device'),
        browser: `${browserName || ''} ${browserVersion || ''}`.trim() || 'Web browser',
        location: [city || '', country || ''].filter(Boolean).join(', ').trim() || null,
        ipAddress,
        isMobile,
        lastActiveAt: resource.lastActiveAt ? new Date(resource.lastActiveAt).getTime() : undefined,
        revokeSession: async (canContinue = () => true) => {
          const isCurrent = () => canRun() && canContinue();
          if (!isCurrent()) {
            return;
          }
          try {
            await revokeSession(id, isCurrent);
          } catch (error) {
            if (isCurrent()) {
              throw error;
            }
          }
        },
      };
    }),
  };
};
