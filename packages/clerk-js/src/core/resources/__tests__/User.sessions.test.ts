import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createSession, createUser } from '@/test/core-fixtures';

import { Clerk } from '../../clerk';
import { BaseResource } from '../internal';
import { User } from '../User';

function response(id: string) {
  const { user: _user, ...session } = createSession({ id, status: 'active' });
  return Object.assign(new Response(), {
    payload: [{ ...session, user: null, latest_activity: { object: 'session_activity', id: `activity_${id}` } }],
  });
}

describe('User session retrieval', () => {
  const clerk = new Clerk('pk_test_Y2xlcmsuZXhhbXBsZS5jb20k');
  const previousClerk = BaseResource.clerk;

  beforeEach(() => {
    BaseResource.clerk = clerk;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    BaseResource.clerk = previousClerk;
  });

  it('preserves cached successes for callers without options', async () => {
    const request = vi.spyOn(clerk.getFapiClient(), 'request').mockResolvedValue(response('sess_first'));
    const user = new User(createUser());
    expect((await user.getSessions()).map(session => session.id)).toEqual(['sess_first']);
    request.mockResolvedValue(response('sess_next'));
    expect((await user.getSessions()).map(session => session.id)).toEqual(['sess_first']);
    expect(request).toHaveBeenCalledOnce();
  });

  it('preserves the cached empty result after failure for callers without options', async () => {
    const request = vi.spyOn(clerk.getFapiClient(), 'request').mockRejectedValue(new Error('Network failure'));
    const user = new User(createUser());
    await expect(user.getSessions()).resolves.toEqual([]);
    request.mockResolvedValue(response('sess_next'));
    await expect(user.getSessions()).resolves.toEqual([]);
    expect(request).toHaveBeenCalledOnce();
  });

  it('makes a fresh read after a legacy caller cached a failed request', async () => {
    const request = vi.spyOn(clerk.getFapiClient(), 'request').mockRejectedValue(new Error('Network failure'));
    const user = new User(createUser());
    await expect(user.getSessions()).resolves.toEqual([]);
    request.mockResolvedValue(response('sess_next'));
    const sessions = await user.getSessions({ forceRefresh: true, throwOnError: true });
    expect(sessions.map(session => session.id)).toEqual(['sess_next']);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('propagates a strict failure without overwriting a successful cache', async () => {
    const request = vi.spyOn(clerk.getFapiClient(), 'request').mockResolvedValue(response('sess_first'));
    const user = new User(createUser());
    await user.getSessions();
    const failure = new Error('Network failure');
    request.mockRejectedValue(failure);
    await expect(user.getSessions({ forceRefresh: true, throwOnError: true })).rejects.toBe(failure);
    expect((await user.getSessions()).map(session => session.id)).toEqual(['sess_first']);
  });

  it('retries a strict failed request and refreshes the cached sessions on success', async () => {
    const request = vi.spyOn(clerk.getFapiClient(), 'request').mockRejectedValue(new Error('Network failure'));
    const user = new User(createUser());
    await expect(user.getSessions({ forceRefresh: true, throwOnError: true })).rejects.toThrow('Network failure');
    request.mockResolvedValue(response('sess_next'));
    expect((await user.getSessions({ forceRefresh: true, throwOnError: true })).map(session => session.id)).toEqual([
      'sess_next',
    ]);
    expect((await user.getSessions()).map(session => session.id)).toEqual(['sess_next']);
    expect(request).toHaveBeenCalledTimes(2);
  });
});
