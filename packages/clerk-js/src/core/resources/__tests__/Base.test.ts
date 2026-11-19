import type { OrganizationJSON } from '@clerk/shared/types';
import { describe, expect, it, vi } from 'vitest';

import { BaseResource, Organization } from '../internal';

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

  describe('_include_client', () => {
    const mockRequest = (response: unknown) => {
      const request = vi.fn().mockResolvedValue({ payload: { response }, status: 200 });
      BaseResource.clerk = {
        // @ts-expect-error - We're not about to mock the entire FapiClient
        getFapiClient: () => ({ request }),
        __internal_setCountry: vi.fn(),
        updateClient: vi.fn(),
      };
      return request;
    };

    const searchOf = (request: ReturnType<typeof vi.fn>) => new URLSearchParams(request.mock.calls[0][0].search);

    const organization = () =>
      new Organization({
        id: 'org_123',
        object: 'organization',
        created_at: 0,
        updated_at: 0,
      } as unknown as OrganizationJSON);

    it('asks for the client on reload()', async () => {
      const request = mockRequest({});

      await new TestResource().reload();

      expect(searchOf(request).get('_include_client')).toBe('true');
    });

    it('keeps the rotating token nonce when asking for the client on reload()', async () => {
      const request = mockRequest({});

      await new TestResource().reload({ rotatingTokenNonce: 'nonce_123' });

      expect(request.mock.calls[0][0].rotatingTokenNonce).toBe('nonce_123');
      expect(searchOf(request).get('_include_client')).toBe('true');
    });

    it('asks for the client on Organization.reload()', async () => {
      const request = mockRequest({ id: 'org_123', object: 'organization' });

      await organization().reload();

      expect(request.mock.calls[0][0].path).toBe('/organizations/org_123');
      expect(searchOf(request).get('_include_client')).toBe('true');
    });

    it('does not ask for the client on other GET requests', async () => {
      const request = mockRequest({ data: [], total_count: 0 });

      await organization().getRoles({ pageSize: 5 });

      expect(searchOf(request).get('_include_client')).toBeNull();
      expect(searchOf(request).get('limit')).toBe('5');
    });
  });
});
