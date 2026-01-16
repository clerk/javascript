import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { InstanceType, OrganizationJSON, SessionJSON } from '@clerk/shared/types';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { clerkMock, createUser, mockJwt, mockNetworkFailedFetch } from '@/test/core-fixtures';

/**
 * Creates a JWT string with the specified iat (issued at) and ttl (time to live).
 * The token will expire at iat + ttl seconds.
 */
function createJwtWithTtl(iatSeconds: number, ttlSeconds: number): string {
  const payload = { exp: iatSeconds + ttlSeconds, iat: iatSeconds, sid: 'session_1', sub: 'user_1' };
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payloadB64}.signature`;
}

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

    it('does not re-cache token when Session is reconstructed with same token', async () => {
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

      expect(SessionTokenCache.size()).toBe(1);
      const cachedEntry1 = SessionTokenCache.get({ tokenId: 'session_1-activeOrganization' });
      expect(cachedEntry1).toBeDefined();

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

      expect(SessionTokenCache.size()).toBe(1);

      const token1 = await session1.getToken();
      const token2 = await session2.getToken();

      expect(token1).toBe(token2);
      expect(token1).toEqual(mockJwt);
      expect(BaseResource.clerk.getFapiClient().request).not.toHaveBeenCalled();
    });

    it('caches token from cookie during degraded mode recovery', async () => {
      BaseResource.clerk = clerkMock();

      SessionTokenCache.clear();

      const sessionFromCookie = new Session({
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

      expect(SessionTokenCache.size()).toBe(1);
      const cachedEntry = SessionTokenCache.get({ tokenId: 'session_1' });
      expect(cachedEntry).toBeDefined();

      const token = await sessionFromCookie.getToken();
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

  describe('origin outage mode fallback', () => {
    let dispatchSpy: ReturnType<typeof vi.spyOn>;
    let fetchSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      SessionTokenCache.clear();
      dispatchSpy = vi.spyOn(eventBus, 'emit');
      fetchSpy = vi.spyOn(BaseResource, '_fetch' as any);
      BaseResource.clerk = clerkMock() as any;
    });

    afterEach(() => {
      dispatchSpy?.mockRestore();
      fetchSpy?.mockRestore();
      BaseResource.clerk = null as any;
    });

    it('should retry with expired token when API returns 422 with missing_expired_token error', async () => {
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

      SessionTokenCache.clear();

      const errorResponse = new ClerkAPIResponseError('Missing expired token', {
        data: [
          { code: 'missing_expired_token', message: 'Missing expired token', long_message: 'Missing expired token' },
        ],
        status: 422,
      });
      fetchSpy.mockRejectedValueOnce(errorResponse);

      fetchSpy.mockResolvedValueOnce({ object: 'token', jwt: mockJwt });

      await session.getToken();

      expect(fetchSpy).toHaveBeenCalledTimes(2);

      expect(fetchSpy.mock.calls[0][0]).toMatchObject({
        path: '/client/sessions/session_1/tokens',
        method: 'POST',
        body: { organizationId: null },
      });

      expect(fetchSpy.mock.calls[1][0]).toMatchObject({
        path: '/client/sessions/session_1/tokens',
        method: 'POST',
        body: { organizationId: null },
        search: { expired_token: mockJwt },
      });
    });

    it('should not retry with expired token when lastActiveToken is not available', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: null,
        last_active_token: null,
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as unknown as SessionJSON);

      SessionTokenCache.clear();

      const errorResponse = new ClerkAPIResponseError('Missing expired token', {
        data: [
          { code: 'missing_expired_token', message: 'Missing expired token', long_message: 'Missing expired token' },
        ],
        status: 422,
      });
      fetchSpy.mockRejectedValue(errorResponse);

      await expect(session.getToken()).rejects.toMatchObject({
        status: 422,
        errors: [{ code: 'missing_expired_token' }],
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('should not retry with expired token for non-422 errors', async () => {
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

      SessionTokenCache.clear();

      const errorResponse = new ClerkAPIResponseError('Bad request', {
        data: [{ code: 'bad_request', message: 'Bad request', long_message: 'Bad request' }],
        status: 400,
      });
      fetchSpy.mockRejectedValueOnce(errorResponse);

      await expect(session.getToken()).rejects.toThrow(ClerkAPIResponseError);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('should not retry with expired token when error code is different', async () => {
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
      } as unknown as SessionJSON);

      SessionTokenCache.clear();

      const errorResponse = new ClerkAPIResponseError('Validation failed', {
        data: [{ code: 'validation_error', message: 'Validation failed', long_message: 'Validation failed' }],
        status: 422,
      });
      fetchSpy.mockRejectedValue(errorResponse);

      await expect(session.getToken()).rejects.toMatchObject({
        status: 422,
        errors: [{ code: 'validation_error' }],
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * Proactive Token Refresh Tests
   *
   * Token timing (for 60-second tokens):
   * - LEEWAY = 10s (token considered "expiring soon")
   * - SYNC_LEEWAY = 5s (buffer for cookie polling)
   * - REFRESH_BUFFER = 2s (buffer before leeway)
   * - Leeway zone starts at: 60 - 10 - 5 = 45 seconds
   * - Proactive timer fires at: 60 - 10 - 5 - 2 = 43 seconds
   */
  describe('proactive token refresh behavior', () => {
    let fetchSpy: ReturnType<typeof vi.spyOn>;
    let dispatchSpy: ReturnType<typeof vi.spyOn>;

    // Use a fixed timestamp for predictable timing
    const BASE_TIME_SECONDS = 1700000000;
    const TOKEN_TTL = 60;

    beforeEach(() => {
      SessionTokenCache.clear();
      dispatchSpy = vi.spyOn(eventBus, 'emit');
      fetchSpy = vi.spyOn(BaseResource, '_fetch' as any);
      BaseResource.clerk = clerkMock() as any;
    });

    afterEach(() => {
      dispatchSpy?.mockRestore();
      fetchSpy?.mockRestore();
      BaseResource.clerk = null as any;
    });

    it('returns cached token before proactive timer fires (t < 43)', async () => {
      // Token issued at BASE_TIME, expires at BASE_TIME + 60
      const jwt = createJwtWithTtl(BASE_TIME_SECONDS, TOKEN_TTL);
      vi.setSystemTime(new Date(BASE_TIME_SECONDS * 1000));

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      fetchSpy.mockClear();

      // Advance to t=40 (before the proactive timer at t=43)
      vi.advanceTimersByTime(40 * 1000);

      const token = await session.getToken();

      expect(token).toEqual(jwt);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('returns OLD token while proactive fetch is in progress (43 < t < 45)', async () => {
      const jwt = createJwtWithTtl(BASE_TIME_SECONDS, TOKEN_TTL);
      vi.setSystemTime(new Date(BASE_TIME_SECONDS * 1000));

      // Create a promise that never resolves during this test (simulating slow network)
      let resolveProactiveFetch: (value: any) => void;
      const pendingPromise = new Promise(resolve => {
        resolveProactiveFetch = resolve;
      });
      fetchSpy.mockReturnValue(pendingPromise);

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      // Allow the initial cache hydration to set up the timer
      await Promise.resolve();

      fetchSpy.mockClear();
      fetchSpy.mockReturnValue(pendingPromise);

      // Advance to t=43 - proactive timer fires, starting background fetch
      vi.advanceTimersByTime(43 * 1000);

      // Advance to t=44 (still before leeway at t=45)
      vi.advanceTimersByTime(1 * 1000);

      // Call getToken - should return OLD token instantly (non-blocking)
      const token = await session.getToken();

      expect(token).toEqual(jwt);
      // Only the proactive fetch should have been triggered
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      // Clean up the pending promise
      resolveProactiveFetch!({ object: 'token', jwt: createJwtWithTtl(BASE_TIME_SECONDS + 43, TOKEN_TTL) });
    });

    it('returns NEW token after proactive fetch completes (43 < t < 45)', async () => {
      const oldJwt = createJwtWithTtl(BASE_TIME_SECONDS, TOKEN_TTL);
      const newJwt = createJwtWithTtl(BASE_TIME_SECONDS + 43, TOKEN_TTL);
      vi.setSystemTime(new Date(BASE_TIME_SECONDS * 1000));

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: oldJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      // Allow the initial cache hydration to set up the timer
      await Promise.resolve();

      fetchSpy.mockClear();

      // Mock the proactive fetch to return new token immediately
      fetchSpy.mockResolvedValueOnce({ object: 'token', jwt: newJwt });

      // Advance to t=43 - proactive timer fires, fetch completes immediately
      vi.advanceTimersByTime(43 * 1000);

      // Allow the proactive fetch promise to resolve and cache update to complete
      await Promise.resolve();
      await Promise.resolve();

      fetchSpy.mockClear();

      // Advance to t=44
      vi.advanceTimersByTime(1 * 1000);

      // Call getToken - should return NEW token from cache
      const token = await session.getToken();

      expect(token).toEqual(newJwt);
      // No additional API call should be made
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('returns NEW token in leeway zone when proactive fetch completed (t >= 45)', async () => {
      const oldJwt = createJwtWithTtl(BASE_TIME_SECONDS, TOKEN_TTL);
      const newJwt = createJwtWithTtl(BASE_TIME_SECONDS + 43, TOKEN_TTL);
      vi.setSystemTime(new Date(BASE_TIME_SECONDS * 1000));

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: oldJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      // Allow the initial cache hydration to set up the timer
      await Promise.resolve();

      fetchSpy.mockClear();

      // Mock the proactive fetch to return new token
      fetchSpy.mockResolvedValueOnce({ object: 'token', jwt: newJwt });

      // Advance to t=43 - proactive timer fires
      vi.advanceTimersByTime(43 * 1000);

      // Allow the proactive fetch promise to resolve and cache update to complete
      await Promise.resolve();
      await Promise.resolve();

      fetchSpy.mockClear();

      // Advance to t=46 (old token would be in leeway zone, but new token is fresh)
      vi.advanceTimersByTime(3 * 1000);

      const token = await session.getToken();

      expect(token).toEqual(newJwt);
      // No additional API call needed - new token is still fresh
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('blocks and fetches new token in leeway zone when proactive fetch failed (t >= 45)', async () => {
      const oldJwt = createJwtWithTtl(BASE_TIME_SECONDS, TOKEN_TTL);
      const newJwt = createJwtWithTtl(BASE_TIME_SECONDS + 46, TOKEN_TTL);
      vi.setSystemTime(new Date(BASE_TIME_SECONDS * 1000));

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: oldJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      fetchSpy.mockClear();

      // Proactive fetch fails silently
      fetchSpy.mockRejectedValueOnce(new Error('Network error'));

      // Advance to t=43 - proactive timer fires, fetch fails
      vi.advanceTimersByTime(43 * 1000);

      // Allow the proactive fetch promise to reject
      await vi.runAllTimersAsync();

      // Second call (from getToken) succeeds
      fetchSpy.mockResolvedValueOnce({ object: 'token', jwt: newJwt });

      // Advance to t=46 (in leeway zone)
      vi.advanceTimersByTime(3 * 1000);

      const token = await session.getToken();

      expect(token).toEqual(newJwt);
      // Two API calls: proactive fetch (failed) + getToken fetch (success)
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it('blocks and fetches new token when timer did not fire (background tab scenario, t >= 45)', async () => {
      const oldJwt = createJwtWithTtl(BASE_TIME_SECONDS, TOKEN_TTL);
      const newJwt = createJwtWithTtl(BASE_TIME_SECONDS + 46, TOKEN_TTL);
      vi.setSystemTime(new Date(BASE_TIME_SECONDS * 1000));

      // Create session which hydrates the cache with onExpiringSoon callback
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: null,
        last_active_token: { object: 'token', jwt: oldJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      // Allow the initial cache hydration to complete
      await Promise.resolve();

      // Simulate background tab scenario: clear cache completely
      // This simulates what happens when the tab was suspended and the cache is empty
      SessionTokenCache.clear();

      fetchSpy.mockClear();
      fetchSpy.mockResolvedValueOnce({ object: 'token', jwt: newJwt });

      // Advance to t=46 (timer never fired because cache was cleared)
      vi.advanceTimersByTime(46 * 1000);

      // getToken() with no cache entry should make an API call
      const token = await session.getToken();

      expect(token).toEqual(newJwt);
      // Should make an API call since there's no cache entry
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });
});
