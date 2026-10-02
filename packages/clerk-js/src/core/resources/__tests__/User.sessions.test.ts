import { ClerkAPIResponseError } from '@clerk/shared/error';
import type { SessionWithActivitiesJSON } from '@clerk/shared/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Clerk } from '../../clerk';
import { BaseResource } from '../Base';
import { User } from '../User';

function session(id: string): SessionWithActivitiesJSON {
  return {
    object: 'session',
    id,
    status: 'active',
    expire_at: 1_900_000_000_000,
    abandon_at: 1_900_000_000_000,
    last_active_at: 1_800_000_000_000,
    actor: null,
    latest_activity: {
      id: 'activity',
      device_type: 'Mac',
      browser_name: 'Chrome',
      browser_version: '100',
      country: 'US',
      city: 'Denver',
      is_mobile: false,
      ip_address: '127.0.0.1',
    },
  };
}

function response(payload: unknown, status = 200) {
  return { payload, status, statusText: '', headers: new Headers() };
}

const request = vi.fn();

beforeEach(() => {
  const clerk = new Clerk('pk_test_Y2xlcmsuYWJjZWYuMTIzNDUuZGV2LmxjbGNsZXJrLmNvbSQ');
  BaseResource.clerk = clerk;
  request.mockReset();
  vi.spyOn(clerk.getFapiClient(), 'request').mockImplementation(request);
});

afterEach(() => vi.restoreAllMocks());

describe('User.getSessions', () => {
  it('bypasses a seeded cache without replacing the default snapshot', async () => {
    const user = new User();
    request.mockResolvedValueOnce(response([session('cached')])).mockResolvedValueOnce(response([session('fresh')]));
    const cached = await user.getSessions();
    expect(await user.getSessions()).toBe(cached);
    expect((await user.getSessions({ __internal_fresh: true })).map(item => item.id)).toEqual(['fresh']);
    expect(await user.getSessions({ __internal_fresh: false })).toBe(cached);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('preserves the default empty fallback and caches it', async () => {
    const user = new User();
    request.mockRejectedValueOnce(new Error('Network unavailable'));
    const result = await user.getSessions();
    expect(result).toEqual([]);
    expect(await user.getSessions()).toBe(result);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('preserves structured HTTP errors and their parameter metadata', async () => {
    request.mockResolvedValueOnce(
      response(
        {
          errors: [
            {
              code: 'form_param_format_invalid',
              message: 'Invalid value',
              long_message: 'Invalid session',
              meta: { param_name: 'session_id' },
            },
          ],
        },
        403,
      ),
    );
    const result = new User().getSessions({ __internal_fresh: true });
    await expect(result).rejects.toBeInstanceOf(ClerkAPIResponseError);
    await expect(result).rejects.toMatchObject({
      status: 403,
      errors: [{ code: 'form_param_format_invalid', meta: { paramName: 'session_id' } }],
    });
  });

  it('rejects server failures', async () => {
    request.mockResolvedValueOnce(
      response({ errors: [{ code: 'internal_error', message: 'Server unavailable' }] }, 500),
    );
    await expect(new User().getSessions({ __internal_fresh: true })).rejects.toMatchObject({ status: 500 });
  });

  it('rejects offline failures instead of treating them as an empty snapshot', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    request.mockRejectedValueOnce(new Error('Offline'));
    await expect(new User().getSessions({ __internal_fresh: true })).rejects.toThrow();
  });

  it.each([null, { response: [] }])('rejects a malformed payload %j', async payload => {
    request.mockResolvedValueOnce(response(payload));
    await expect(new User().getSessions({ __internal_fresh: true })).rejects.toThrow();
  });

  it('accepts an empty successful snapshot without caching it', async () => {
    const user = new User();
    request.mockResolvedValueOnce(response([])).mockResolvedValueOnce(response([session('later')]));
    expect(await user.getSessions({ __internal_fresh: true })).toEqual([]);
    expect((await user.getSessions()).map(item => item.id)).toEqual(['later']);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('keeps overlapping fresh responses out of subsequent reads', async () => {
    const user = new User();
    const older = Promise.withResolvers<ReturnType<typeof response>>();
    request
      .mockReturnValueOnce(older.promise)
      .mockResolvedValueOnce(response([session('newer')]))
      .mockResolvedValueOnce(response([session('latest')]));
    const pending = user.getSessions({ __internal_fresh: true });
    expect((await user.getSessions({ __internal_fresh: true })).map(item => item.id)).toEqual(['newer']);
    older.resolve(response([session('older')]));
    expect((await pending).map(item => item.id)).toEqual(['older']);
    expect((await user.getSessions()).map(item => item.id)).toEqual(['latest']);
    expect(request).toHaveBeenCalledTimes(3);
  });
});
