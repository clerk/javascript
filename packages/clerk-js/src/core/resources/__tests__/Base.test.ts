import { describe, expect, it, vi } from 'vitest';

import { BaseResource } from '../internal';

class TestResource extends BaseResource {
  constructor() {
    super();
  }

  fetch() {
    return this._baseGet();
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

  it('populates retryAfter on 503 error responses', async () => {
    BaseResource.clerk = {
      // @ts-expect-error - We're not about to mock the entire FapiClient
      getFapiClient: () => {
        return {
          request: vi.fn().mockResolvedValue({
            payload: {},
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Retry-After': new Date(new Date().getTime() + 60000).toUTCString() }),
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
});
