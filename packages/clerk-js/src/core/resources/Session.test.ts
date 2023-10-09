import type { SessionJSON } from '@clerk/types';

import { eventBus } from '../events';
import { clerkMock, createUser } from '../test/fixtures';
import { BaseResource, Session } from './internal';

export const mockJwt =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yR0lvUWhiVXB5MGhYN0IyY1ZrdVRNaW5Yb0QiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2FjY291bnRzLmluc3BpcmVkLnB1bWEtNzQubGNsLmRldiIsImV4cCI6MTY2NjY0ODMxMCwiaWF0IjoxNjY2NjQ4MjUwLCJpc3MiOiJodHRwczovL2NsZXJrLmluc3BpcmVkLnB1bWEtNzQubGNsLmRldiIsIm5iZiI6MTY2NjY0ODI0MCwic2lkIjoic2Vzc18yR2JEQjRlbk5kQ2E1dlMxenBDM1h6Zzl0SzkiLCJzdWIiOiJ1c2VyXzJHSXBYT0VwVnlKdzUxcmtabjlLbW5jNlN4ciJ9.n1Usc-DLDftqA0Xb-_2w8IGs4yjCmwc5RngwbSRvwevuZOIuRoeHmE2sgCdEvjfJEa7ewL6EVGVcM557TWPW--g_J1XQPwBy8tXfz7-S73CEuyRFiR97L2AHRdvRtvGtwR-o6l8aHaFxtlmfWbQXfg4kFJz2UGe9afmh3U9-f_4JOZ5fa3mI98UMy1-bo20vjXeWQ9aGrqaxHQxjnzzC-1Kpi5LdPvhQ16H0dPB8MHRTSM5TAuLKTpPV7wqixmbtcc2-0k6b9FKYZNqRVTaIyV-lifZloBvdzlfOF8nW1VVH_fx-iW5Q3hovHFcJIULHEC1kcAYTubbxzpgeVQepGg';

describe('Session', () => {
  describe('getToken()', () => {
    let dispatchSpy;

    beforeEach(() => {
      dispatchSpy = jest.spyOn(eventBus, 'dispatch');
      BaseResource.clerk = clerkMock() as any;
    });

    afterEach(() => {
      dispatchSpy?.mockRestore();
      BaseResource.clerk = null as any;
    });

    it('dispatches token:update event on getToken', async () => {
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

      expect(dispatchSpy).toBeCalledTimes(1);
      expect(dispatchSpy.mock.calls[0]).toMatchSnapshot();
    });

    it('dispatches token:update event on initilization with lastActiveToken', () => {
      new Session({
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

      expect(dispatchSpy).toBeCalledTimes(1);
      expect(dispatchSpy.mock.calls[0]).toMatchSnapshot();
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

      const isAuthorized = await session.isAuthorized({ permission: 'org:profile:delete' });

      expect(isAuthorized).toBe(true);
    });

    it('user with permission to read memberships should not be deleting the organization', async () => {
      const session = new Session({
        status: 'active',
        id: 'session_1',
        object: 'session',
        user: createUser({
          organization_memberships: [{ name: 'Org1', id: 'org1', permissions: ['org:memberships:read'] }],
        }),
        last_active_organization_id: 'org1',
        last_active_token: { object: 'token', jwt: mockJwt },
        actor: null,
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      } as SessionJSON);

      const isAuthorized = await session.isAuthorized({ permission: 'org:profile:delete' });

      expect(isAuthorized).toBe(false);
    });
  });
});
