import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthContextValue } from '../../contexts/AuthContext';
import { authStore } from '../authStore';

describe('authStore', () => {
  const mockServerSnapshot: AuthContextValue = {
    actor: null,
    factorVerificationAge: null,
    orgId: 'org_server',
    orgPermissions: ['org:read'],
    orgRole: 'admin',
    orgSlug: 'server-org',
    sessionClaims: null,
    sessionId: 'sess_server',
    sessionStatus: 'active',
    userId: 'user_server',
  };

  const mockClientSnapshot: AuthContextValue = {
    actor: null,
    factorVerificationAge: null,
    orgId: 'org_client',
    orgPermissions: ['org:write'],
    orgRole: 'member',
    orgSlug: 'client-org',
    sessionClaims: null,
    sessionId: 'sess_client',
    sessionStatus: 'active',
    userId: 'user_client',
  };

  beforeEach(() => {
    authStore['isHydrated'] = false;
    authStore['currentSnapshot'] = null;
    authStore['initialServerSnapshot'] = null;
    authStore['listeners'].clear();
  });

  describe('getServerSnapshot', () => {
    it('returns initial server snapshot before hydration', () => {
      authStore.setInitialServerSnapshot(mockServerSnapshot);

      expect(authStore.getServerSnapshot()).toEqual(mockServerSnapshot);
    });

    it('returns current snapshot if no initial server snapshot is set', () => {
      authStore.setSnapshot(mockClientSnapshot);

      expect(authStore.getServerSnapshot()).toEqual(mockClientSnapshot);
    });

    it('returns initial server snapshot even if current snapshot differs (before hydration)', () => {
      authStore.setInitialServerSnapshot(mockServerSnapshot);
      authStore.setSnapshot(mockClientSnapshot);

      expect(authStore.getServerSnapshot()).toEqual(mockServerSnapshot);
    });

    it('returns current snapshot after hydration is complete', () => {
      authStore.setInitialServerSnapshot(mockServerSnapshot);
      authStore.setSnapshot(mockClientSnapshot);
      authStore.markHydrated();

      expect(authStore.getServerSnapshot()).toEqual(mockClientSnapshot);
    });
  });

  describe('getClientSnapshot', () => {
    it('always returns current snapshot', () => {
      authStore.setSnapshot(mockClientSnapshot);

      expect(authStore.getClientSnapshot()).toEqual(mockClientSnapshot);
    });

    it('returns empty snapshot if no snapshot is set', () => {
      expect(authStore.getClientSnapshot()).toEqual({
        actor: undefined,
        factorVerificationAge: null,
        orgId: undefined,
        orgPermissions: undefined,
        orgRole: undefined,
        orgSlug: undefined,
        sessionClaims: undefined,
        sessionId: undefined,
        sessionStatus: undefined,
        userId: undefined,
      });
    });
  });

  describe('subscribe', () => {
    it('calls listener when snapshot changes', () => {
      const listener = vi.fn();
      const unsubscribe = authStore.subscribe(listener);

      authStore.setSnapshot(mockClientSnapshot);

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
    });

    it('does not call listener after unsubscribe', () => {
      const listener = vi.fn();
      const unsubscribe = authStore.subscribe(listener);

      unsubscribe();
      authStore.setSnapshot(mockClientSnapshot);

      expect(listener).not.toHaveBeenCalled();
    });

    it('supports multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      authStore.subscribe(listener1);
      authStore.subscribe(listener2);

      authStore.setSnapshot(mockClientSnapshot);

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe('hydration flow', () => {
    it('maintains consistent state during SSR and hydration', () => {
      authStore.setInitialServerSnapshot(mockServerSnapshot);

      expect(authStore.getServerSnapshot()).toEqual(mockServerSnapshot);
      expect(authStore.getClientSnapshot().userId).toBeUndefined();

      authStore.setSnapshot(mockServerSnapshot);

      expect(authStore.getServerSnapshot()).toEqual(mockServerSnapshot);
      expect(authStore.getClientSnapshot()).toEqual(mockServerSnapshot);

      authStore.markHydrated();

      authStore.setSnapshot(mockClientSnapshot);

      expect(authStore.getServerSnapshot()).toEqual(mockClientSnapshot);
      expect(authStore.getClientSnapshot()).toEqual(mockClientSnapshot);
    });

    it('prevents hydration mismatch by returning stable server snapshot', () => {
      authStore.setInitialServerSnapshot(mockServerSnapshot);

      const snapshot1 = authStore.getServerSnapshot();
      const snapshot2 = authStore.getServerSnapshot();

      expect(snapshot1).toBe(snapshot2);
      expect(snapshot1).toEqual(mockServerSnapshot);
    });
  });
});

