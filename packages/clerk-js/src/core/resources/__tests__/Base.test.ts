import { describe, expect, it, vi } from 'vitest';

import { BaseResource } from '../internal';

class TestResource extends BaseResource {
  constructor() {
    super();
  }

  fetch() {
    return this._baseGet();
  }

  mutate() {
    return BaseResource._fetch({ method: 'PATCH', path: '/test' });
  }

  fromJSON() {
    return this;
  }
}

describe('BaseResource', () => {
  it('populates retryAfter on 429 error responses', async () => {
    BaseResource.clerk = {
      // @ts-expect-error - We're not about to mock the entire FapiClient
      getFapiClient: () => {
        return {
          request: vi.fn().mockResolvedValue({
            payload: {},
            status: 429,
            statusText: 'Too Many Requests',
            headers: new Headers({ 'Retry-After': '60' }),
          }),
        };
      },
      __internal_setCountry: vi.fn(),
    };
    const resource = new TestResource();
    const errResponse = await resource.fetch().catch(err => err);
    console.dir(errResponse);
    expect(errResponse.retryAfter).toBe(60);
  });

  it('does not populate retryAfter on invalid header', async () => {
    BaseResource.clerk = {
      // @ts-expect-error - We're not about to mock the entire FapiClient
      getFapiClient: () => {
        return {
          request: vi.fn().mockResolvedValue({
            payload: {},
            status: 429,
            statusText: 'Too Many Requests',
            headers: new Headers({ 'Retry-After': 'abcd' }),
          }),
        };
      },
      __internal_setCountry: vi.fn(),
    };
    const resource = new TestResource();
    const errResponse = await resource.fetch().catch(err => err);
    console.dir(errResponse);
    expect(errResponse.retryAfter).toBe(undefined);
  });

  it('applies a piggybacked client update before throwing a failed mutation response', async () => {
    const requestingSession = { id: 'sess_requesting', status: 'ended' };
    const otherSession = { id: 'sess_other', status: 'active' };
    const client = { id: 'client_1', sessions: [requestingSession, otherSession] };
    const updateClient = vi.fn();

    BaseResource.clerk = {
      // @ts-expect-error - We're not about to mock the entire FapiClient
      getFapiClient: () => ({
        request: vi.fn().mockResolvedValue({
          payload: {
            client,
            errors: [{ code: 'form_password_validation_failed', message: 'Password is incorrect' }],
          },
          status: 422,
          statusText: 'Unprocessable Entity',
          headers: new Headers(),
        }),
      }),
      __internal_setCountry: vi.fn(),
      updateClient,
    } as any;

    const resource = new TestResource();
    await expect(resource.mutate()).rejects.toMatchObject({
      errors: [expect.objectContaining({ code: 'form_password_validation_failed' })],
    });

    expect(updateClient).toHaveBeenCalledWith(
      expect.objectContaining({
        sessions: expect.arrayContaining([
          expect.objectContaining({ id: requestingSession.id, status: requestingSession.status }),
          expect.objectContaining({ id: otherSession.id, status: otherSession.status }),
        ]),
      }),
    );
  });
});
