import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

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

    const { data } = await apiClient.users.getUserOauthAccessToken('user_deadbeef', 'oauth_google');

    expect(data[0].externalAccountId).toBe('eac_2dYS7stz9bgxQsSRvNqEAHhuxvW');
    expect(data[0].provider).toBe('oauth_google');
    expect(data[0].token).toBe('<token>');
    expect(data[0].scopes).toEqual(['email', 'profile']);
  });
});
