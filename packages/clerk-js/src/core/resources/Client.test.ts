import type { ClientJSON } from '@clerk/types';

import { createSession } from '../test/fixtures';
import { BaseResource, Client } from './internal';

export const mockJwt =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc18yR0lvUWhiVXB5MGhYN0IyY1ZrdVRNaW5Yb0QiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL2FjY291bnRzLmluc3BpcmVkLnB1bWEtNzQubGNsLmRldiIsImV4cCI6MTY2NjY0ODMxMCwiaWF0IjoxNjY2NjQ4MjUwLCJpc3MiOiJodHRwczovL2NsZXJrLmluc3BpcmVkLnB1bWEtNzQubGNsLmRldiIsIm5iZiI6MTY2NjY0ODI0MCwic2lkIjoic2Vzc18yR2JEQjRlbk5kQ2E1dlMxenBDM1h6Zzl0SzkiLCJzdWIiOiJ1c2VyXzJHSXBYT0VwVnlKdzUxcmtabjlLbW5jNlN4ciJ9.n1Usc-DLDftqA0Xb-_2w8IGs4yjCmwc5RngwbSRvwevuZOIuRoeHmE2sgCdEvjfJEa7ewL6EVGVcM557TWPW--g_J1XQPwBy8tXfz7-S73CEuyRFiR97L2AHRdvRtvGtwR-o6l8aHaFxtlmfWbQXfg4kFJz2UGe9afmh3U9-f_4JOZ5fa3mI98UMy1-bo20vjXeWQ9aGrqaxHQxjnzzC-1Kpi5LdPvhQ16H0dPB8MHRTSM5TAuLKTpPV7wqixmbtcc2-0k6b9FKYZNqRVTaIyV-lifZloBvdzlfOF8nW1VVH_fx-iW5Q3hovHFcJIULHEC1kcAYTubbxzpgeVQepGg';

describe('Client Singleton', () => {
  it('destroy', async () => {
    const session = createSession({});
    const clientObjectJSON: ClientJSON = {
      object: 'client',
      id: 'test_id',
      status: 'active',
      last_active_session_id: 'test_session_id',
      sign_in: null,
      sign_up: null,
      sessions: [session],
      created_at: jest.now(),
      updated_at: jest.now(),
    };

    // @ts-expect-error This is a private method that we are mocking
    BaseResource._fetch = jest.fn().mockReturnValue(
      Promise.resolve({
        response: clientObjectJSON,
      }),
    );

    const client = Client.getInstance().fromJSON(clientObjectJSON);
    expect(client.sessions.length).toBe(1);
    expect(client.createdAt).not.toBeNull();
    expect(client.updatedAt).not.toBeNull();
    expect(client.lastActiveSessionId).not.toBeNull();

    await client.destroy();

    expect(client.sessions.length).toBe(0);
    expect(client.createdAt).toBeNull();
    expect(client.updatedAt).toBeNull();
    expect(client.lastActiveSessionId).toBeNull();

    // @ts-expect-error This is a private method that we are mocking
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'DELETE',
      path: `/client`,
    });
  });
});
