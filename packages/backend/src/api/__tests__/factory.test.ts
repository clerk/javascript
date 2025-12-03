import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import jwksJson from '../../fixtures/jwks.json';
import userJson from '../../fixtures/user.json';
import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('api.client', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    secretKey: 'deadbeef',
  });

  it('executes a successful backend API request for a single resource and parses the response', async () => {
    server.use(
      http.get(
        `https://api.clerk.test/v1/users/user_deadbeef`,
        validateHeaders(() => {
          return HttpResponse.json(userJson);
        }),
      ),
    );

    const response = await apiClient.users.getUser('user_deadbeef');

    expect(response.firstName).toBe('John');
    expect(response.lastName).toBe('Doe');
    expect(response.emailAddresses[0].emailAddress).toBe('john.doe@clerk.test');
    expect(response.phoneNumbers[0].phoneNumber).toBe('+311-555-2368');
    expect(response.externalAccounts[0].emailAddress).toBe('john.doe@clerk.test');
    expect(response.publicMetadata.zodiac_sign).toBe('leo');
  });

  it('executes 2 backend API request for users.getUserList()', async () => {
    server.use(
      http.get(
        `https://api.clerk.test/v1/users`,
        validateHeaders(() => {
          return HttpResponse.json([userJson]);
        }),
      ),
      http.get(
        `https://api.clerk.test/v1/users/count`,
        validateHeaders(() => {
          return HttpResponse.json({ object: 'total_count', total_count: 2 });
        }),
      ),
    );
    const { data, totalCount } = await apiClient.users.getUserList({
      offset: 2,
      limit: 5,
      userId: ['user_cafebabe'],
    });

    expect(data[0].firstName).toBe('John');
    expect(data[0].id).toBe('user_cafebabe');
    expect(data.length).toBe(1);
    expect(totalCount).toBe(2);
  });

  it('executes a successful backend API request for a paginated response', async () => {
    server.use(
      http.get(
        `https://api.clerk.test/v1/users/user_123/organization_memberships`,
        validateHeaders(() => {
          return HttpResponse.json({
            data: [{ id: '1' }],
            total_count: 3,
          });
        }),
      ),
    );

    const { data: response, totalCount } = await apiClient.users.getOrganizationMembershipList({
      offset: 2,
      limit: 5,
      userId: 'user_123',
    });

    expect(response[0].id).toBe('1');
    expect(totalCount).toBe(3);
    expect(response.length).toBe(1);
  });

  it('executes a successful backend API request to create a new resource', async () => {
    server.use(
      http.post(
        `https://api.clerk.test/v1/users`,
        validateHeaders(() => {
          return HttpResponse.json(userJson);
        }),
      ),
    );

    const response = await apiClient.users.createUser({
      firstName: 'John',
      lastName: 'Doe',
      publicMetadata: {
        star_sign: 'Leon',
      },
    });

    expect(response.firstName).toBe('John');
    expect(response.lastName).toBe('Doe');
    expect(response.publicMetadata.zodiac_sign).toBe('leo');
  });

  it('executes a failed backend API request and parses the error response', async () => {
    const mockErrorPayload = {
      code: 'whatever_error',
      message: 'whatever error',
      long_message: 'some long message',
      meta: { param_name: 'some param' },
    };
    const traceId = 'trace_id_123';

    server.use(
      http.get(
        `https://api.clerk.test/v1/users/user_deadbeef`,
        validateHeaders(() => {
          return HttpResponse.json(
            { errors: [mockErrorPayload], clerk_trace_id: traceId },
            { status: 422, headers: { 'cf-ray': traceId } },
          );
        }),
      ),
    );

    const errResponse = await apiClient.users.getUser('user_deadbeef').catch(err => err);

    expect(errResponse.clerkTraceId).toBe(traceId);
    expect(errResponse.status).toBe(422);
    expect(errResponse.errors[0].code).toBe('whatever_error');
    expect(errResponse.errors[0].message).toBe('whatever error');
    expect(errResponse.errors[0].longMessage).toBe('some long message');
    expect(errResponse.errors[0].meta.paramName).toBe('some param');
  });

  it('executes a failed backend API request and include cf ray id when trace not present', async () => {
    server.use(
      http.get(
        `https://api.clerk.test/v1/users/user_deadbeef`,
        validateHeaders(() => {
          return HttpResponse.json({ errors: [] }, { status: 500, headers: { 'cf-ray': 'mock_cf_ray' } });
        }),
      ),
    );

    const errResponse = await apiClient.users.getUser('user_deadbeef').catch(err => err);

    expect(errResponse.status).toBe(500);
    expect(errResponse.clerkTraceId).toBe('mock_cf_ray');
  });

  it('executes a failed backend API request and includes Retry-After header', async () => {
    server.use(
      http.get(
        `https://api.clerk.test/v1/users/user_deadbeef`,
        validateHeaders(() => {
          return HttpResponse.json({ errors: [] }, { status: 429, headers: { 'retry-after': '123' } });
        }),
      ),
    );

    const errResponse = await apiClient.users.getUser('user_deadbeef').catch(err => err);

    expect(errResponse.status).toBe(429);
    expect(errResponse.retryAfter).toBe(123);
  });

  it('executes a failed backend API request and ignores invalid Retry-After header', async () => {
    server.use(
      http.get(
        `https://api.clerk.test/v1/users/user_deadbeef`,
        validateHeaders(() => {
          return HttpResponse.json({ errors: [] }, { status: 429, headers: { 'retry-after': 'abc' } });
        }),
      ),
    );

    const errResponse = await apiClient.users.getUser('user_deadbeef').catch(err => err);

    expect(errResponse.status).toBe(429);
    expect(errResponse.retryAfter).toBe(undefined);
  });

  it('executes a successful backend API request to delete a domain', async () => {
    const DOMAIN_ID = 'dmn_123';
    server.use(
      http.delete(
        `https://api.clerk.test/v1/domains/${DOMAIN_ID}`,
        validateHeaders(() => {
          return HttpResponse.json({
            object: 'domain',
            id: DOMAIN_ID,
            deleted: true,
          });
        }),
      ),
    );

    await apiClient.domains.deleteDomain(DOMAIN_ID);
  });

  it('successfully retrieves user access tokens from backend API for a specific provider (with prefix)', async () => {
    server.use(
      http.get(
        'https://api.clerk.test/v1/users/user_deadbeef/oauth_access_tokens/oauth_google',
        validateHeaders(({ request }): any => {
          const paginated = new URL(request.url).searchParams.get('paginated');

          if (!paginated) {
            return new HttpResponse(null, { status: 404 });
          }

          return HttpResponse.json({
            data: [
              {
                external_account_id: 'eac_2dYS7stz9bgxQsSRvNqEAHhuxvW',
                object: 'oauth_access_token',
                token: '<token>',
                provider: 'oauth_google',
                public_metadata: {},
                label: null,
                scopes: ['email', 'profile'],
              },
            ],
            total_count: 1,
          });
        }),
      ),
    );

    const { data } = await apiClient.users.getUserOauthAccessToken('user_deadbeef', 'oauth_google');

    expect(data[0].externalAccountId).toBe('eac_2dYS7stz9bgxQsSRvNqEAHhuxvW');
    expect(data[0].provider).toBe('oauth_google');
    expect(data[0].token).toBe('<token>');
    expect(data[0].scopes).toEqual(['email', 'profile']);
  });

  it('successfully retrieves user access tokens from backend API for a specific provider', async () => {
    server.use(
      http.get(
        'https://api.clerk.test/v1/users/user_deadbeef/oauth_access_tokens/oauth_google',
        validateHeaders(({ request }): any => {
          const paginated = new URL(request.url).searchParams.get('paginated');

          if (!paginated) {
            return new HttpResponse(null, { status: 404 });
          }

          return HttpResponse.json({
            data: [
              {
                external_account_id: 'eac_2dYS7stz9bgxQsSRvNqEAHhuxvW',
                object: 'oauth_access_token',
                token: '<token>',
                provider: 'oauth_google',
                public_metadata: {},
                label: null,
                scopes: ['email', 'profile'],
              },
            ],
            total_count: 1,
          });
        }),
      ),
    );

    const { data } = await apiClient.users.getUserOauthAccessToken('user_deadbeef', 'google');

    expect(data[0].externalAccountId).toBe('eac_2dYS7stz9bgxQsSRvNqEAHhuxvW');
    expect(data[0].provider).toBe('oauth_google');
    expect(data[0].token).toBe('<token>');
    expect(data[0].scopes).toEqual(['email', 'profile']);
  });

  describe('JWKS', () => {
    it('executes a successful backend API request for a single resource and returns the raw response', async () => {
      server.use(
        http.get(
          `https://api.clerk.test/v1/jwks`,
          validateHeaders(() => {
            return HttpResponse.json(jwksJson);
          }),
        ),
      );

      const response = await apiClient.jwks.getJwks();
      const key = response.keys?.[0];

      expect(key).toBeDefined();
      expect(key?.kid).toBe('ins_1234');
      expect(key?.alg).toBe('RS256');
      expect(key?.kty).toBe('RSA');
      expect(key?.use).toBe('sig');
      expect(key?.e).toBe('BQGF');
      expect(key?.n).toBe(
        'xV3jihnMy4sr5jJ4S66YTc6FxnFsVy3weiyJFYOAdo515AZMrpMMdraAiVmnXZfolZpv7CcnsnG290cg-XfGRNk-Jil_tJt2SLGtiT9LtWT_iev4zN8veRGzTaOb6C-Qb6T_8xsjP_sp0a92zyNgyc4UxR-acMmOqxjkHmx1q0U1fCom83WI59Yu5VmvLM4MA-1sLkmAE1bTzp4ie-_xu9anwsS3H97MONGtildB4nAG0L-lj7tReNHoYLkciEKCqqUMoK-o6JN29OKozpqiI4dVv0oityWw2ygf6eR5qrKZZjrjbAMt_emXBFGQ5Y1QSsriJoRoykGcdbXaU7S_QV',
      );
    });
  });

  describe('Authorization header', () => {
    it('preserves existing Authorization header when provided in headerParams', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_test_xxx',
        machineSecretKey: 'ak_test_xxx',
        useMachineSecretKey: true,
      });

      server.use(
        http.post(
          'https://api.clerk.test/m2m_tokens/verify',
          validateHeaders(({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer ak_test_in_header_params');
            return HttpResponse.json({
              object: 'machine_to_machine_token',
              id: 'mt_test',
            });
          }),
        ),
      );

      const response = await apiClient.m2m.verify({
        machineSecretKey: 'ak_test_in_header_params', // this will be added to headerParams.Authorization
        token: 'mt_secret_test',
      });
      expect(response.id).toBe('mt_test');
    });

    it('uses machine secret key when useMachineSecretKey is true and no existing Authorization header', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_test_123',
        machineSecretKey: 'ak_test_xxx',
        useMachineSecretKey: true,
      });

      server.use(
        http.post(
          'https://api.clerk.test/m2m_tokens/verify',
          validateHeaders(({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer ak_test_xxx');
            return HttpResponse.json({
              object: 'machine_to_machine_token',
              id: 'mt_test',
            });
          }),
        ),
      );

      const response = await apiClient.m2m.verify({
        token: 'mt_secret_test',
      });
      expect(response.id).toBe('mt_test');
    });

    it('falls back to secret key when useMachineSecretKey is false (default)', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_test_xxx',
        machineSecretKey: 'ak_test_xxx',
        // useMachineSecretKey: false, this is default
      });

      server.use(
        http.get(
          `https://api.clerk.test/v1/users/user_deadbeef`,
          validateHeaders(({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer sk_test_xxx');
            return HttpResponse.json(userJson);
          }),
        ),
      );

      const response = await apiClient.users.getUser('user_deadbeef');

      expect(response.id).toBe('user_cafebabe');
    });

    it('falls back to secret key when machineSecretKey is not provided', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_test_xxx',
        useMachineSecretKey: true,
      });

      server.use(
        http.get(
          `https://api.clerk.test/v1/users/user_deadbeef`,
          validateHeaders(({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer sk_test_xxx');
            return HttpResponse.json(userJson);
          }),
        ),
      );

      const response = await apiClient.users.getUser('user_deadbeef');

      expect(response.id).toBe('user_cafebabe');
    });

    it('prioritizes machine secret key over instance secret key when both are provided and useMachineSecretKey is true', async () => {
      const apiClient = createBackendApiClient({
        apiUrl: 'https://api.clerk.test',
        secretKey: 'sk_test_xxx',
        machineSecretKey: 'ak_test_xxx',
        useMachineSecretKey: true,
      });

      server.use(
        http.post(
          'https://api.clerk.test/m2m_tokens/verify',
          validateHeaders(({ request }) => {
            expect(request.headers.get('Authorization')).toBe('Bearer ak_test_xxx');
            return HttpResponse.json({
              object: 'machine_to_machine_token',
              id: 'mt_test',
            });
          }),
        ),
      );

      const response = await apiClient.m2m.verify({
        token: 'mt_secret_test',
      });
      expect(response.id).toBe('mt_test');
    });
  });
});
