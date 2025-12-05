import type { InstanceType, OrganizationJSON, SessionJSON } from '@clerk/shared/types';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { clerkMock, createUser, mockJwt, mockNetworkFailedFetch } from '@/test/core-fixtures';

import { eventBus } from '../../events';
import { createFapiClient } from '../../fapiClient';
import { SessionTokenCache } from '../../tokenCache';
import { BaseResource, Organization, Session } from '../internal';

const baseFapiClientOptions = {
  frontendApi: 'clerk.example.com',
  getSessionId() {
    return 'sess_1qq9oy5GiNHxdR2XWU6gG6mIcBX';
  },
  instanceType: 'development' as InstanceType,
};

describe('Session', () => {
  beforeEach(() => {
    // Mock Date.now() to make the test tokens appear valid
    // mockJwt has iat: 1666648250, exp: 1666648310
    // Set current time to 1666648260 (10 seconds after iat, 50 seconds before exp)
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1666648260 * 1000));
  });

  afterEach(() => {
    SessionTokenCache.clear();
    vi.useRealTimers();
  });

  describe('getToken()', () => {
    let dispatchSpy;

    beforeEach(() => {
      dispatchSpy = vi.spyOn(eventBus, 'emit');
      BaseResource.clerk = clerkMock();
    });

    afterEach(() => {
      dispatchSpy?.mockRestore();
      BaseResource.clerk = null as any;
    });

    it('dispatches token:update event on getToken without active organization', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: null,
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      await session.getToken();

      expect(dispatchSpy).toHaveBeenCalledTimes(2);
      expect(dispatchSpy.mock.calls[0]).toEqual([
        'token:update',
        {
          token: expect.objectContaining({
            jwt: expect.objectContaining({
              claims: expect.objectContaining({
                sid: expect.any(String),
                sub: expect.any(String),
              }),
            }),
          }),
        },
      ]);
    });

    it('hydrates token cache from lastActiveToken', async () => {
      BaseResource.clerk = clerkMock({
        organization: new Organization({ id: 'activeOrganization' } as OrganizationJSON),
      });

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: 'activeOrganization',
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      const token = await session.getToken();

      await session.getToken({ organizationId: 'activeOrganization' });

      expect(BaseResource.clerk.getFapiClient().request).not.toHaveBeenCalled();

      expect(token).toEqual(mockJwt);
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
    });

    it('returns same token without API call when Session is reconstructed', async () => {
      BaseResource.clerk = clerkMock({
        organization: new Organization({ id: 'activeOrganization' } as OrganizationJSON),
      });

      SessionTokenCache.clear();

      const session1 = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: 'activeOrganization',
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      const session2 = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: 'activeOrganization',
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      const token1 = await session1.getToken();
      const token2 = await session2.getToken();

      expect(token1).toBe(token2);
      expect(token1).toEqual(mockJwt);
      expect(BaseResource.clerk.getFapiClient().request).not.toHaveBeenCalled();
    });

    it('returns lastActiveToken without API call (degraded mode recovery)', async () => {
      BaseResource.clerk = clerkMock();

      SessionTokenCache.clear();

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      const token = await session.getToken();

      expect(token).toEqual(mockJwt);
      expect(BaseResource.clerk.getFapiClient().request).not.toHaveBeenCalled();
    });

    it('dispatches token:update event on getToken with active organization', async () => {
      BaseResource.clerk = clerkMock({
        organization: new Organization({ id: 'activeOrganization' } as OrganizationJSON),
      });

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: 'activeOrganization',
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      await session.getToken();

      expect(dispatchSpy).toHaveBeenCalledTimes(2);
      expect(dispatchSpy.mock.calls[0]).toEqual([
        'token:update',
        {
          token: expect.objectContaining({
            jwt: expect.objectContaining({
              claims: expect.objectContaining({
                sid: expect.any(String),
                sub: expect.any(String),
              }),
            }),
          }),
        },
      ]);
      expect(dispatchSpy.mock.calls[1]).toEqual(['session:tokenResolved', null]);
    });

    it('does not dispatch token:update if template is provided', async () => {
      BaseResource.clerk = clerkMock({
        organization: new Organization({ id: 'activeOrganization' } as OrganizationJSON),
      });

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: 'activeOrganization',
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      await session.getToken({ template: 'foobar' });

      expect(dispatchSpy).toHaveBeenCalledTimes(0);
    });

    it('dispatches token:update when provided organization ID matches current active organization', async () => {
      BaseResource.clerk = clerkMock({
        organization: new Organization({ id: 'activeOrganization' } as OrganizationJSON),
      });

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: 'activeOrganization',
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      await session.getToken({ organizationId: 'activeOrganization' });

      expect(dispatchSpy).toHaveBeenCalledTimes(2);
    });

    it('does not dispatch token:update when provided organization ID does not match current active organization', async () => {
      BaseResource.clerk = clerkMock();

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: 'activeOrganization',
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      await session.getToken({ organizationId: 'anotherOrganization' });

      expect(dispatchSpy).toHaveBeenCalledTimes(0);
    });

    describe('with offline browser and network failure', () => {
      let warnSpy;
      beforeEach(() => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: false,
        });
        warnSpy = vi.spyOn(console, 'warn').mockReturnValue();
      });

      afterEach(() => {
        Object.defineProperty(window.navigator, 'onLine', {
          writable: true,
          value: true,
        });
        warnSpy.mockRestore();
      });

      it('returns null', async () => {
        const session = new Session({
          status: 'active',
          id: 'session_1',
          object: 'session',
          user: createUser({}),
          last_active_organization_id: 'activeOrganization',
          actor: null,
          created_at: new Date().getTime(),
          updated_at: new Date().getTime(),
        } as SessionJSON);

        mockNetworkFailedFetch();
        BaseResource.clerk = { getFapiClient: () => createFapiClient(baseFapiClientOptions) } as any;

        const token = await session.getToken();

        expect(global.fetch).toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        expect(token).toEqual(null);
      });
    });

    it(`uses the current session's lastActiveOrganizationId by default, not clerk.organization.id`, async () => {
      BaseResource.clerk = clerkMock({
        organization: new Organization({ id: 'oldActiveOrganization' } as OrganizationJSON),
      });

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: 'newActiveOrganization',
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      await session.getToken();

      expect((BaseResource.fapiClient.request as Mock<any>).mock.calls[0][0]).toMatchObject({
        body: { organizationId: 'newActiveOrganization' },
      });
    });

    it('deduplicates concurrent getToken calls to prevent multiple API requests', async () => {
      BaseResource.clerk = clerkMock();

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: null,
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      const requestSpy = BaseResource.clerk.getFapiClient().request as Mock<any>;
      requestSpy.mockClear();

      const [token1, token2, token3] = await Promise.all([session.getToken(), session.getToken(), session.getToken()]);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(token1).toEqual(mockJwt);
      expect(token2).toEqual(mockJwt);
      expect(token3).toEqual(mockJwt);
    });

    it('deduplicates concurrent getToken calls with same template', async () => {
      BaseResource.clerk = clerkMock();

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: null,
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      const requestSpy = BaseResource.clerk.getFapiClient().request as Mock<any>;
      requestSpy.mockClear();

      const [token1, token2] = await Promise.all([
        session.getToken({ template: 'custom-template' }),
        session.getToken({ template: 'custom-template' }),
      ]);

      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(token1).toEqual(mockJwt);
      expect(token2).toEqual(mockJwt);
    });

    it('does not deduplicate getToken calls with different templates', async () => {
      BaseResource.clerk = clerkMock();

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: null,
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      const requestSpy = BaseResource.clerk.getFapiClient().request as Mock<any>;
      requestSpy.mockClear();

      await Promise.all([session.getToken({ template: 'template1' }), session.getToken({ template: 'template2' })]);

      expect(requestSpy).toHaveBeenCalledTimes(2);
    });

    it('does not deduplicate getToken calls with different organization IDs', async () => {
      BaseResource.clerk = clerkMock();

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: null,
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      const requestSpy = BaseResource.clerk.getFapiClient().request as Mock<any>;
      requestSpy.mockClear();

      await Promise.all([session.getToken({ organizationId: 'org_1' }), session.getToken({ organizationId: 'org_2' })]);

      expect(requestSpy).toHaveBeenCalledTimes(2);
    });

    describe('stale-while-revalidate (SWR) behavior', () => {
      it('returns stale token immediately while refreshing in background', async () => {
        BaseResource.clerk = clerkMock();
        const requestSpy = BaseResource.clerk.getFapiClient().request as Mock<any>;

        const session = new Session({
          status: 'active',
          id: 'session_1',
          object: 'session',
          user: createUser({}),
          last_active_organization_id: null,
          last_active_token: { object: 'token', jwt: mockJwt },
          actor: null,
          created_at: new Date().getTime(),
          updated_at: new Date().getTime(),
        } as SessionJSON);

        await Promise.resolve();

        // Advance time so token needs refresh (< 15s remaining of 60s TTL)
        vi.advanceTimersByTime(46 * 1000);

        // Hold the network request pending
        let resolveNetworkRequest!: (value: any) => void;
        requestSpy.mockClear();
        requestSpy.mockReturnValueOnce(
          new Promise(resolve => {
            resolveNetworkRequest = resolve;
          }),
        );

        // Concurrent calls should all return immediately with stale token
        const [token1, token2, token3] = await Promise.all([
          session.getToken(),
          session.getToken(),
          session.getToken(),
        ]);

        expect(token1).toEqual(mockJwt);
        expect(token2).toEqual(mockJwt);
        expect(token3).toEqual(mockJwt);
        expect(requestSpy).toHaveBeenCalledTimes(1);

        // Cleanup: resolve the pending request
        resolveNetworkRequest({ payload: { object: 'token', jwt: mockJwt }, status: 200 });
        await vi.advanceTimersByTimeAsync(0);
      });

      it('continues returning tokens after background refresh failure', async () => {
        BaseResource.clerk = clerkMock();
        const requestSpy = BaseResource.clerk.getFapiClient().request as Mock<any>;

        const session = new Session({
          status: 'active',
          id: 'session_1',
          object: 'session',
          user: createUser({}),
          last_active_organization_id: null,
          last_active_token: { object: 'token', jwt: mockJwt },
          actor: null,
          created_at: new Date().getTime(),
          updated_at: new Date().getTime(),
        } as SessionJSON);

        await Promise.resolve();
        vi.advanceTimersByTime(46 * 1000);

        // Background refresh fails
        requestSpy.mockClear();
        requestSpy.mockRejectedValueOnce(new Error('Network error'));

        const token = await session.getToken();
        expect(token).toEqual(mockJwt);

        // Wait for background failure to complete
        await vi.advanceTimersByTimeAsync(100);

        // Subsequent call should still return token (stale is preserved)
        const token2 = await session.getToken();
        expect(token2).toEqual(mockJwt);
      });

      it('retries background refresh after previous failure', async () => {
        BaseResource.clerk = clerkMock();
        const requestSpy = BaseResource.clerk.getFapiClient().request as Mock<any>;

        const session = new Session({
          status: 'active',
          id: 'session_1',
          object: 'session',
          user: createUser({}),
          last_active_organization_id: null,
          last_active_token: { object: 'token', jwt: mockJwt },
          actor: null,
          created_at: new Date().getTime(),
          updated_at: new Date().getTime(),
        } as SessionJSON);

        await Promise.resolve();
        vi.advanceTimersByTime(46 * 1000);

        // First call triggers background refresh that fails
        requestSpy.mockClear();
        requestSpy.mockRejectedValueOnce(new Error('Network error'));

        await session.getToken();
        expect(requestSpy).toHaveBeenCalledTimes(1);

        await vi.advanceTimersByTimeAsync(100);

        // Second call should trigger another refresh attempt
        requestSpy.mockClear();
        requestSpy.mockResolvedValueOnce({ payload: { object: 'token', jwt: mockJwt }, status: 200 });

        await session.getToken();
        expect(requestSpy).toHaveBeenCalledTimes(1);
      });

      it('uses refreshed token for subsequent calls after background refresh succeeds', async () => {
        BaseResource.clerk = clerkMock();
        const requestSpy = BaseResource.clerk.getFapiClient().request as Mock<any>;

        const newMockJwt =
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NjY2NDg0MDAsImlhdCI6MTY2NjY0ODM0MCwiaXNzIjoiaHR0cHM6Ly9jbGVyay5leGFtcGxlLmNvbSIsImp0aSI6Im5ld3Rva2VuIiwibmJmIjoxNjY2NjQ4MzQwLCJzaWQiOiJzZXNzXzFxcTlveTVHaU5IeGRSMlhXVTZnRzZtSWNCWCIsInN1YiI6InVzZXJfMXFxOW95NUdpTkh4ZFIyWFdVNmdHNm1JY0JYIn0.mock';

        const session = new Session({
          status: 'active',
          id: 'session_1',
          object: 'session',
          user: createUser({}),
          last_active_organization_id: null,
          last_active_token: { object: 'token', jwt: mockJwt },
          actor: null,
          created_at: new Date().getTime(),
          updated_at: new Date().getTime(),
        } as SessionJSON);

        await Promise.resolve();
        vi.advanceTimersByTime(46 * 1000);

        // Background refresh returns new token
        requestSpy.mockClear();
        requestSpy.mockResolvedValueOnce({ payload: { object: 'token', jwt: newMockJwt }, status: 200 });

        // First call returns stale token
        const staleToken = await session.getToken();
        expect(staleToken).toEqual(mockJwt);

        // Wait for background refresh to complete
        await vi.advanceTimersByTimeAsync(100);

        // Subsequent call returns refreshed token (no new API call needed)
        requestSpy.mockClear();
        const freshToken = await session.getToken();
        expect(freshToken).toEqual(newMockJwt);
        expect(requestSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('touch()', () => {
    let dispatchSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      dispatchSpy = vi.spyOn(eventBus, 'emit');
      BaseResource.clerk = clerkMock();
    });

    afterEach(() => {
      dispatchSpy?.mockRestore();
      BaseResource.clerk = null as any;
    });

    it('dispatches token:update event on touch', async () => {
      const mockToken = { object: 'token', jwt: mockJwt };
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: null,
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        last_active_token: mockToken,
      } as SessionJSON);

      (BaseResource.clerk.getFapiClient().request as Mock).mockResolvedValue({
        payload: session,
      });

      await session.touch();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith('token:update', {
        token: session.lastActiveToken,
      });
    });
  });

  describe('isAuthorized()', () => {
    it('user with permission to delete the organization should be able to delete the  organization', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({
          organization_memberships: [{ name: 'Org1', id: 'org1' }],
        }),
        last_active_organization_id: 'org1',
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({ permission: 'org:sys_profile:delete' });

      expect(isAuthorized).toBe(true);
    });

    it('user with permission to read memberships should not be deleting the organization', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({
          organization_memberships: [{ name: 'Org1', id: 'org1', permissions: ['org:sys_memberships:read'] }],
        }),
        last_active_organization_id: 'org1',
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({ permission: 'org:sys_profile:delete' });

      expect(isAuthorized).toBe(false);
    });

    it('user with second factor stale and with permission to delete the organization should NOT be able to delete the organization ', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({
          organization_memberships: [{ name: 'Org1', id: 'org1' }],
        }),
        last_active_organization_id: 'org1',
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: [0, 11],
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        permission: 'org:sys_profile:delete',
        reverification: {
          level: 'multi_factor',
          afterMinutes: 10,
        },
      });

      expect(isAuthorized).toBe(false);
    });

    it('user with second factor verified and without permission to delete the organization should NOT be able to delete the organization ', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({
          organization_memberships: [{ name: 'Org1', id: 'org1', permissions: [] }],
        }),
        last_active_organization_id: 'org1',
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: [0, 0],
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        permission: 'org:sys_profile:delete',
        reverification: {
          level: 'multi_factor',
          afterMinutes: 10,
        },
      });

      expect(isAuthorized).toBe(false);
    });

    it('user with second factor verified should be authorized', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: [0, 0],
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        reverification: {
          level: 'multi_factor',
          afterMinutes: 10,
        },
      });

      expect(isAuthorized).toBe(true);
    });

    it('user with second factor stale should NOT be authorized', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: [0, 10],
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        reverification: {
          level: 'multi_factor',
          afterMinutes: 10,
        },
      });

      expect(isAuthorized).toBe(false);
    });

    it('user with first factor stale should NOT be authorized', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: [10, 0],
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        reverification: {
          level: 'multi_factor',
          afterMinutes: 10,
        },
      });

      expect(isAuthorized).toBe(false);
    });

    it('user with first factor verified should be authorized', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: [0, 0],
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        reverification: {
          level: 'multi_factor',
          afterMinutes: 10,
        },
      });

      expect(isAuthorized).toBe(true);
    });

    it('user with second factor not enrolled should be downgraded to first factor and be considered authorized', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: [0, -1],
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        reverification: {
          level: 'multi_factor',
          afterMinutes: 10,
        },
      });

      expect(isAuthorized).toBe(true);
    });

    it('user with second factor not enrolled should be downgraded to first factor and be considered unauthorized', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: [11, -1],
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        reverification: 'strict',
      });

      expect(isAuthorized).toBe(false);
    });

    it('user with second factor not enrolled and first factor verified should be authorized for multifactor assurance', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: [0, -1],
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        reverification: 'strict_mfa',
      });

      expect(isAuthorized).toBe(true);
    });

    it('user with second factor not enrolled and first factor stale should be NOT authorized for multifactor assurance', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: [11, -1],
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        reverification: {
          level: 'multi_factor',
          afterMinutes: 10,
        },
      });

      expect(isAuthorized).toBe(false);
    });

    it('user with second factor verified and first factor verified should be authorized for multifactor assurance', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: [0, 0],
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        reverification: {
          level: 'multi_factor',
          afterMinutes: 10,
        },
      });

      expect(isAuthorized).toBe(true);
    });

    it('user with second factor stale and first factor verified should NOT be authorized for multifactor assurance', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: [0, 10],
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        reverification: {
          level: 'multiFactor',
          afterMinutes: 10,
        },
      });

      expect(isAuthorized).toBe(false);
    });

    it('user with second factor stale and first factor stale should NOT be authorized for multifactor assurance', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: [10, 10],
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        reverification: {
          level: 'multiFactor',
          afterMinutes: 10,
        },
      });

      expect(isAuthorized).toBe(false);
    });

    it('user with missing factor_verification_age should NOT be authorized for multifactor assurance', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: null,
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        reverification: {
          level: 'multiFactor',
          afterMinutes: 10,
        },
      });

      expect(isAuthorized).toBe(false);
    });

    it('user with missing factor_verification_age should NOT be authorized for fistFactor assurance', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: null,
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        reverification: {
          level: 'first_factor',
          afterMinutes: 10,
        },
      });

      expect(isAuthorized).toBe(false);
    });

    it('user with missing factor_verification_age should NOT be authorized for secondFactor assurance', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: null,
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        reverification: 'strict',
      });

      expect(isAuthorized).toBe(false);
    });

    /**
     * Test for invalid input
     */
    it('incorrect params for reverification', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: [0, 0],
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        reverification: {
          //@ts-expect-error
          level: 'any level',
          afterMinutes: 10,
        },
      });

      expect(isAuthorized).toBe(false);
    });

    it('incorrect params for reverification', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: [0, 0],
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        reverification: {
          //@ts-expect-error
          level: 'any level',
          //@ts-expect-error
          afterMinutes: 'some-value',
        },
      });

      expect(isAuthorized).toBe(false);
    });

    it('incorrect params for reverification', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: [0, 0],
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        // @ts-expect-error
        reverification: 'invalid-value',
      });

      expect(isAuthorized).toBe(false);
    });

    it('incorrect params for reverification', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: [0, 0],
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        // @ts-expect-error
        reverification: 123,
      });

      expect(isAuthorized).toBe(false);
    });

    it('incorrect params for reverification', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: [0, 0],
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        reverification: {
          level: 'first_factor',
          //@ts-expect-error
          afterMinutes: '10',
        },
      });

      expect(isAuthorized).toBe(false);
    });

    /**
     * Not possible state but still nice to know they work
     */
    it('first factor not enrolled should NOT be authorized for multifactor assurance', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: [-1, 0],
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        reverification: {
          level: 'multi_factor',
          afterMinutes: 10,
        },
      });

      expect(isAuthorized).toBe(false);
    });

    it('first factor not enrolled should NOT be authorized for first_factor assurance', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: [-1, 0],
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        reverification: {
          level: 'first_factor',
          afterMinutes: 10,
        },
      });

      expect(isAuthorized).toBe(false);
    });

    it('first factor not enrolled should be authorized for secondFactor assurance', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser(),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
        factor_verification_age: [-1, 0],
      } as SessionJSON);

      const isAuthorized = session.checkAuthorization({
        reverification: 'strict',
      });

      expect(isAuthorized).toBe(true);
    });
  });
});
