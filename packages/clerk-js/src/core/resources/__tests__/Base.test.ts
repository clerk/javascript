import type { OrganizationJSON } from '@clerk/shared/types';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { FraudProtection } from '../../fraudProtection';
import { BaseResource, Client, Organization, Token } from '../internal';

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

  describe('include_client', () => {
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

      expect(searchOf(request).get('include_client')).toBe('true');
    });

    it('keeps the rotating token nonce when asking for the client on reload()', async () => {
      const request = mockRequest({});

      await new TestResource().reload({ rotatingTokenNonce: 'nonce_123' });

      expect(request.mock.calls[0][0].rotatingTokenNonce).toBe('nonce_123');
      expect(searchOf(request).get('include_client')).toBe('true');
    });

    it('asks for the client on Organization.reload()', async () => {
      const request = mockRequest({ id: 'org_123', object: 'organization' });

      await organization().reload();

      expect(request.mock.calls[0][0].path).toBe('/organizations/org_123');
      expect(searchOf(request).get('include_client')).toBe('true');
    });

    it('does not ask for the client on other GET requests', async () => {
      const request = mockRequest({ data: [], total_count: 0 });

      await organization().getRoles({ pageSize: 5 });

      expect(searchOf(request).get('include_client')).toBeNull();
      expect(searchOf(request).get('limit')).toBe('5');
    });
  });

  describe('supersedable requests', () => {
    const clientJSON = (id: string) => ({
      object: 'client',
      id,
      sessions: [],
      sign_up: null,
      sign_in: null,
      last_active_session_id: null,
      created_at: 0,
      updated_at: 0,
    });

    const payload = { response: { id: 'sess_1' }, client: clientJSON('client_response') };

    let request: Mock;
    let updateClient: Mock;

    beforeEach(() => {
      Client.clearInstance();
      request = vi.fn();
      updateClient = vi.fn();
      BaseResource.clerk = {
        // @ts-expect-error - We're not about to mock the entire FapiClient
        getFapiClient: () => ({ request }),
        __internal_setCountry: vi.fn(),
        updateClient,
        session: { id: 'sess_1', lastActiveOrganizationId: 'org_a' },
      };
    });

    afterEach(() => {
      Client.clearInstance();
      BaseResource.clerk = null as any;
    });

    const respondAfter = (inFlight: () => unknown, response: unknown = { payload, status: 200 }) => {
      request.mockImplementationOnce(async () => {
        await inFlight();
        return response;
      });
    };

    const touch = (opts = { supersedable: true }) =>
      BaseResource._fetch({ method: 'POST', path: '/client/sessions/sess_1/touch' }, opts);

    it('drops the response when the client is written in flight', async () => {
      respondAfter(() => Client.getOrCreateInstance().fromJSON(clientJSON('client_newer') as any));

      expect(await touch()).toBeNull();
      expect(updateClient).not.toHaveBeenCalled();
      expect(Client.getOrCreateInstance().id).toBe('client_newer');
    });

    it('drops the response when the active session changes in flight', async () => {
      respondAfter(() => {
        BaseResource.clerk.session = { id: 'sess_2', lastActiveOrganizationId: 'org_a' } as any;
      });

      expect(await touch()).toBeNull();
      expect(updateClient).not.toHaveBeenCalled();
    });

    it('drops the response when the state changes while it waits on a captcha challenge', async () => {
      const fraudProtection = FraudProtection.getInstance() as any;
      fraudProtection.inflightException = Promise.resolve().then(() => {
        (BaseResource.clerk.session as any).lastActiveOrganizationId = 'org_b';
      });
      request.mockResolvedValueOnce({ payload, status: 200 });

      try {
        expect(await touch()).toBeNull();
        expect(updateClient).not.toHaveBeenCalled();
      } finally {
        fraudProtection.inflightException = null;
      }
    });

    it('drops the response when the active organization changes in flight', async () => {
      respondAfter(() => {
        (BaseResource.clerk.session as any).lastActiveOrganizationId = 'org_b';
      });

      expect(await touch()).toBeNull();
      expect(updateClient).not.toHaveBeenCalled();
    });

    it('applies the response when nothing changed in flight', async () => {
      respondAfter(() => undefined);

      expect(await touch()).toBe(payload);
      expect(updateClient).toHaveBeenCalledTimes(1);
      expect(Client.getOrCreateInstance().id).toBe('client_response');
    });

    it('applies a non-supersedable response when the client is written in flight', async () => {
      respondAfter(() => Client.getOrCreateInstance().fromJSON(clientJSON('client_newer') as any));

      expect(await touch({ supersedable: false })).toBe(payload);
      expect(updateClient).toHaveBeenCalledTimes(1);
      expect(Client.getOrCreateInstance().id).toBe('client_response');
    });

    it('still throws on a superseded error response without applying its client', async () => {
      respondAfter(() => Client.getOrCreateInstance().fromJSON(clientJSON('client_newer') as any), {
        payload: {
          errors: [{ code: 'form_param_invalid', long_message: 'Invalid' }],
          meta: { client: clientJSON('client_error') },
        },
        status: 422,
      });

      await expect(touch()).rejects.toThrow('Invalid');
      expect(updateClient).not.toHaveBeenCalled();
      expect(Client.getOrCreateInstance().id).toBe('client_newer');
    });

    it('is not superseded by a token request settling in flight', async () => {
      respondAfter(() => Token.create('/client/sessions/sess_1/tokens'));
      request.mockResolvedValueOnce({ payload: { object: 'token', jwt: null }, status: 200 });

      expect(await touch()).toBe(payload);
      expect(updateClient).toHaveBeenCalledTimes(1);
    });
  });
});
