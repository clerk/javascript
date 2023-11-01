import type { ClientJSON } from '@clerk/types';

import { createSession } from '../test/fixtures';
import { BaseResource, Client } from './internal';

describe('Client Singleton', () => {
  it('destroy', async () => {
    const session = createSession();
    const clientObjectJSON: ClientJSON = {
      object: 'client',
      id: 'test_id',
      status: 'active',
      last_active_session_id: 'test_session_id',
      sign_in: null,
      sign_up: null,
      sessions: [session],
      created_at: jest.now() - 1000,
      updated_at: jest.now(),
    };

    const destroyedSession = createSession({
      id: 'test_session_id',
      abandon_at: jest.now(),
      status: 'ended',
      last_active_token: undefined,
    });

    const clientObjectDeletedJSON = {
      id: 'test_id_deleted',
      status: 'ended',
      last_active_session_id: null,
      sign_in: null,
      sign_up: null,
      sessions: [destroyedSession],
      created_at: jest.now() - 1000,
      updated_at: jest.now(),
    };

    // @ts-expect-error This is a private method that we are mocking
    BaseResource._fetch = jest.fn().mockReturnValue(
      Promise.resolve({
        client: null,
        response: clientObjectDeletedJSON,
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
