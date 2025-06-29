import type { InstanceType, OrganizationJSON, SessionJSON } from '@clerk/types';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { eventBus } from '../../events';
import { createFapiClient } from '../../fapiClient';
import { SessionTokenCache } from '../../tokenCache';
import { clerkMock, createUser, mockJwt, mockNetworkFailedFetch } from '../../vitest/fixtures';
import { BaseResource, Organization, Session } from '../internal';

const FIXED_DATE = new Date('2025-01-01T00:00:00.000Z');

const baseFapiClientOptions = {
  frontendApi: 'clerk.example.com',
  getSessionId() {
    return 'sess_1qq9oy5GiNHxdR2XWU6gG6mIcBX';
  },
  instanceType: 'development' as InstanceType,
};

describe('Session', () => {
  afterEach(() => {
    SessionTokenCache.clear();
  });

  describe('getToken()', () => {
    let dispatchSpy;

    beforeEach(() => {
      dispatchSpy = vi.spyOn(eventBus, 'emit');
      BaseResource.clerk = clerkMock() as any;
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
      }) as any;

      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({}),
        last_active_organization_id: 'activeOrganization',
        last_active_token: {
          object: 'token',
          jwt: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yVDlwUkZST0NnYlJPRW1DbDNlX1ZYOEVfMVJSZWJUQ3JfQWZlWXciLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2NsZXJrLmV4YW1wbGUuY29tIiwiZXhwIjoxNzM1Njg5NzAwLCJpYXQiOjE3MzU2ODk2MDAsImlzcyI6Imh0dHBzOi8vY2xlcmsuZXhhbXBsZS5jb20iLCJuYmYiOjE3MzU2ODk1OTAsInN1YiI6InVzZXJfMTIzIn0.signature',
        },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      const token = await session.getToken();

      await session.getToken({ organizationId: 'activeOrganization' });

      expect(BaseResource.clerk.getFapiClient().request).not.toHaveBeenCalled();

      expect(token).toEqual(
        'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yVDlwUkZST0NnYlJPRW1DbDNlX1ZYOEVfMVJSZWJUQ3JfQWZlWXciLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2NsZXJrLmV4YW1wbGUuY29tIiwiZXhwIjoxNzM1Njg5NzAwLCJpYXQiOjE3MzU2ODk2MDAsImlzcyI6Imh0dHBzOi8vY2xlcmsuZXhhbXBsZS5jb20iLCJuYmYiOjE3MzU2ODk1OTAsInN1YiI6InVzZXJfMTIzIn0.signature',
      );
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
    });

    it('dispatches token:update event on getToken with active organization', async () => {
      BaseResource.clerk = clerkMock({
        organization: new Organization({ id: 'activeOrganization' } as OrganizationJSON),
      }) as any;

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
      }) as any;

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
      }) as any;

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
      BaseResource.clerk = clerkMock() as any;

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
      }) as any;

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
  });

  describe('touch()', () => {
    let dispatchSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      dispatchSpy = vi.spyOn(eventBus, 'emit');
      BaseResource.clerk = clerkMock() as any;
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

describe('Session Snapshots', () => {
  it('should match snapshot for session instance structure', () => {
    const user = createUser({ id: 'user_123', first_name: 'John', last_name: 'Doe' });
    const sessionJSON: SessionJSON = {
      object: 'session',
      id: 'session_123',
      status: 'active',
      user: user,
      last_active_organization_id: 'org_123',
      last_active_token: {
        object: 'token',
        jwt: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yVDlwUkZST0NnYlJPRW1DbDNlX1ZYOEVfMVJSZWJUQ3JfQWZlWXciLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2NsZXJrLmV4YW1wbGUuY29tIiwiZXhwIjoxNzM1Njg5NzAwLCJpYXQiOjE3MzU2ODk2MDAsImlzcyI6Imh0dHBzOi8vY2xlcmsuZXhhbXBsZS5jb20iLCJuYmYiOjE3MzU2ODk1OTAsInN1YiI6InVzZXJfMTIzIn0.signature',
      },
      actor: null,
      created_at: 1735689600000,
      updated_at: 1735689700000,
      factor_verification_age: [0, 5],
    };

    const session = new Session(sessionJSON);

    const sessionSnapshot = {
      id: session.id,
      status: session.status,
      lastActiveOrganizationId: session.lastActiveOrganizationId,
      createdAt: session.createdAt?.getTime(),
      updatedAt: session.updatedAt?.getTime(),
      user: {
        id: session.user?.id,
        firstName: session.user?.firstName,
        lastName: session.user?.lastName,
      },
      lastActiveToken: session.lastActiveToken
        ? {
            object: session.lastActiveToken.object,
            jwt: typeof session.lastActiveToken.jwt === 'string' ? 'jwt_token_present' : null,
          }
        : null,
    };

    expect(sessionSnapshot).toMatchSnapshot();
  });

  it('should match snapshot for session with no organization', () => {
    const user = createUser({ id: 'user_456', first_name: 'Jane', last_name: 'Smith' });
    const sessionJSON: SessionJSON = {
      object: 'session',
      id: 'session_456',
      status: 'active',
      user: user,
      last_active_organization_id: null,
      last_active_token: null,
      actor: null,
      created_at: 1735689600000,
      updated_at: 1735689600000,
      factor_verification_age: null,
    };

    const session = new Session(sessionJSON);

    const sessionSnapshot = {
      id: session.id,
      status: session.status,
      lastActiveOrganizationId: session.lastActiveOrganizationId,
      createdAt: session.createdAt?.getTime(),
      updatedAt: session.updatedAt?.getTime(),
      user: {
        id: session.user?.id,
        firstName: session.user?.firstName,
        lastName: session.user?.lastName,
      },
      lastActiveToken: session.lastActiveToken,
    };

    expect(sessionSnapshot).toMatchSnapshot();
  });

  it('should match snapshot for session structure', () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);

    const session = new Session({
      object: 'session',
      id: 'sess_123',
      client_id: 'client_123',
      user_id: 'user_123',
      status: 'active',
      last_active_at: 1735689600000,
      last_active_organization_id: 'org_123',
      actor: null,
      created_at: 1735689500000,
      updated_at: 1735689600000,
      abandoned_at: null,
      expire_at: 1735776000000,
      last_active_token: {
        object: 'token',
        jwt: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yVDlwUkZST0NnYlJPRW1DbDNlX1ZYOEVfMVJSZWJUQ3JfQWZlWXciLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2NsZXJrLmV4YW1wbGUuY29tIiwiZXhwIjoxNzM1Njg5NzAwLCJpYXQiOjE3MzU2ODk2MDAsImlzcyI6Imh0dHBzOi8vY2xlcmsuZXhhbXBsZS5jb20iLCJuYmYiOjE3MzU2ODk1OTAsInN1YiI6InVzZXJfMTIzIn0.signature',
      },
      user: {
        object: 'user',
        id: 'user_123',
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        email_addresses: [],
        phone_numbers: [],
        web3_wallets: [],
        external_accounts: [],
        passkeys: [],
        organization_memberships: [],
        saml_accounts: [],
        enterprise_accounts: [],
        public_metadata: {},
        private_metadata: {},
        unsafe_metadata: {},
        created_at: 1735689400000,
        updated_at: 1735689500000,
        last_sign_in_at: 1735689600000,
        profile_image_url: 'https://example.com/avatar.jpg',
        image_url: 'https://example.com/avatar.jpg',
        has_image: true,
        primary_email_address_id: null,
        primary_phone_number_id: null,
        primary_web3_wallet_id: null,
        password_enabled: true,
        two_factor_enabled: false,
        totp_enabled: false,
        backup_code_enabled: false,
        mfa_enabled_at: null,
        mfa_disabled_at: null,
        legal_accepted_at: null,
        create_organization_enabled: true,
        delete_self_enabled: true,
        last_active_at: 1735689600000,
        banned: false,
        locked: false,
        lockout_expires_in_seconds: null,
        verification_attempts_remaining: 3,
      },
      public_user_data: {
        first_name: 'Test',
        last_name: 'User',
        image_url: 'https://example.com/avatar.jpg',
        has_image: true,
        identifier: 'testuser',
        user_id: 'user_123',
      },
    } as any);

    expect(session).toMatchSnapshot();

    vi.useRealTimers();
  });

  it('should match snapshot for __internal_toSnapshot method', () => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);

    const session = new Session({
      object: 'session',
      id: 'sess_snapshot',
      client_id: 'client_snapshot',
      user_id: 'user_snapshot',
      status: 'active',
      last_active_at: 1735689600000,
      last_active_organization_id: 'org_snapshot',
      actor: null,
      created_at: 1735689500000,
      updated_at: 1735689600000,
      abandoned_at: null,
      expire_at: 1735776000000,
      last_active_token: {
        object: 'token',
        jwt: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yVDlwUkZST0NnYlJPRW1DbDNlX1ZYOEVfMVJSZWJUQ3JfQWZlWXciLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2NsZXJrLmV4YW1wbGUuY29tIiwiZXhwIjoxNzM1Njg5NzAwLCJpYXQiOjE3MzU2ODk2MDAsImlzcyI6Imh0dHBzOi8vY2xlcmsuZXhhbXBsZS5jb20iLCJuYmYiOjE3MzU2ODk1OTAsInN1YiI6InVzZXJfMTIzIn0.signature',
      },
      user: {
        object: 'user',
        id: 'user_snapshot',
        username: 'snapshotuser',
        first_name: 'Snapshot',
        last_name: 'User',
        email_addresses: [],
        phone_numbers: [],
        web3_wallets: [],
        external_accounts: [],
        passkeys: [],
        organization_memberships: [],
        saml_accounts: [],
        enterprise_accounts: [],
        public_metadata: { role: 'admin' },
        private_metadata: { internal_id: 12345 },
        unsafe_metadata: {},
        created_at: 1735689400000,
        updated_at: 1735689500000,
        last_sign_in_at: 1735689600000,
        profile_image_url: 'https://example.com/snapshot-avatar.jpg',
        image_url: 'https://example.com/snapshot-avatar.jpg',
        has_image: true,
        primary_email_address_id: 'email_snapshot',
        primary_phone_number_id: null,
        primary_web3_wallet_id: null,
        password_enabled: true,
        two_factor_enabled: true,
        totp_enabled: true,
        backup_code_enabled: true,
        mfa_enabled_at: 1735689550000,
        mfa_disabled_at: null,
        legal_accepted_at: 1735689400000,
        create_organization_enabled: true,
        delete_self_enabled: true,
        last_active_at: 1735689600000,
        banned: false,
        locked: false,
        lockout_expires_in_seconds: null,
        verification_attempts_remaining: 3,
      },
      public_user_data: {
        first_name: 'Snapshot',
        last_name: 'User',
        image_url: 'https://example.com/snapshot-avatar.jpg',
        has_image: true,
        identifier: 'snapshotuser',
        user_id: 'user_snapshot',
      },
    } as any);

    expect(session.__internal_toSnapshot()).toMatchSnapshot();

    vi.useRealTimers();
  });
});
