import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import userJson from '../../fixtures/user.json';
import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('api.client', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    apiVersion: 'v1',
    secretKey: 'deadbeef',
  });

  it('executes a successful backend API request for a single resource and parses the response', async () => {
    server.use(
      http.get(
        `https://api.clerk.test/v1/users/:userId`,
        validateHeaders(() => HttpResponse.json(userJson)),
      ),
    );

    const res = await apiClient.users.get({ userId: 'user_deadbeef' });

    expect(res.firstName).toBe('John');
    expect(res.lastName).toBe('Doe');
    expect(res.emailAddresses?.[0].emailAddress).toBe('john.doe@clerk.test');
    expect(res.phoneNumbers?.[0].phoneNumber).toBe('+311-555-2368');
    expect(res.externalAccounts?.[0].emailAddress).toBe('john.doe@clerk.test');
    expect(res.publicMetadata?.zodiac_sign).toBe('leo');
  });

  it('executes a successful backend API request and extends getters off user model', async () => {
    server.use(
      http.get(
        `https://api.clerk.test/v1/users/:userId`,
        validateHeaders(() => HttpResponse.json(userJson)),
      ),
    );

    const res = await apiClient.users.get({ userId: 'user_deadbeef' });

    // fullName
    expect(res.firstName).toBe('John');
    expect(res.lastName).toBe('Doe');
    expect(res.fullName).toBe('John Doe');

    // primaryEmailAddress
    expect(res.emailAddresses?.[0].emailAddress).toBe('john.doe@clerk.test');
    expect(res.primaryEmailAddress?.emailAddress).toBe('john.doe@clerk.test');

    // primaryPhoneNumber
    expect(res.phoneNumbers?.[0].phoneNumber).toBe('+311-555-2368');
    expect(res.primaryPhoneNumber?.phoneNumber).toBe('+311-555-2368');

    // primaryWeb3Wallet
    expect(res.web3Wallets?.[0].web3Wallet).toBe('0x0000000000000000000000000000000000000000');
    expect(res.primaryWeb3Wallet?.web3Wallet).toBe('0x0000000000000000000000000000000000000000');
  });

  it('executes 2 backend API request for users.list() / users.count()', async () => {
    server.use(
      http.get(
        `https://api.clerk.test/v1/users`,
        validateHeaders(() => HttpResponse.json([userJson])),
      ),
      http.get(
        `https://api.clerk.test/v1/users/count`,
        validateHeaders(() => HttpResponse.json({ object: 'total_count', total_count: 2 })),
      ),
    );

    const res = await apiClient.users.list({
      offset: 2,
      limit: 5,
      userId: ['user_cafebabe'],
    });

    expect(res[0].firstName).toBe('John');
    expect(res[0].id).toBe('user_cafebabe');
    expect(res.length).toBe(1);

    const resCount = await apiClient.users.count({
      userId: ['user_cafebabe'],
    });

    expect(resCount.object).toBe('total_count');
    expect(resCount.totalCount).toBe(2);
  });

  it('executes a successful backend API request for a paginated response', async () => {
    const userId = 'user_123';

    server.use(
      http.get(
        `https://api.clerk.test/v1/users/:userId/organization_memberships`,
        validateHeaders(() => {
          return HttpResponse.json({
            data: [
              {
                object: 'organization_membership',
                id: '1',
                role: 'member',
                role_name: 'Member',
                permissions: ['read'],
                public_metadata: {},
                organization: {
                  object: 'organization',
                  id: 'org_123',
                  name: 'Test Organization',
                  public_metadata: {},
                  private_metadata: {},
                  slug: 'test-organization',
                  members_count: 1,
                  missing_member_with_elevated_permissions: false,
                  pending_invitations_count: 0,
                  max_allowed_memberships: 1,
                  admin_delete_enabled: false,
                  created_at: 1742849028,
                  updated_at: 1742849029,
                },
                created_at: 1742849026,
                updated_at: 1742849027,
              },
            ],
            total_count: 3,
          });
        }),
      ),
    );

    const res = await apiClient.users.getOrganizationMemberships({
      offset: 2,
      limit: 3,
      userId,
    });

    expect(res.data[0].id).toBe('1');
    expect(res.totalCount).toBe(3);
    expect(res.data.length).toBe(1);
  });

  it('executes a successful backend API request to create a new resource', async () => {
    server.use(http.post('https://api.clerk.test/v1/users', () => HttpResponse.json(userJson)));

    const res = await apiClient.users.create({
      externalId: 'user_123',
      firstName: 'John',
      lastName: 'Doe',
      publicMetadata: {
        zodiac_sign: 'Leon',
      },
    });

    expect(res.firstName).toBe('John');
    expect(res.lastName).toBe('Doe');
    expect(res.publicMetadata?.zodiac_sign).toBe('leo');
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

    const res = await apiClient.users
      .get({ userId: 'user_deadbeef' }, { retries: { strategy: 'none' } })
      .catch(err => err);

    expect(res.cause.clerkTraceId).toBe(traceId);
    expect(res.cause.status).toBe(422);

    // TODO: Parse the error response in the SDK
    // expect(res.response.errors[0].code).toBe('whatever_error');
    // expect(res.response.errors[0].message).toBe('whatever error');
    // expect(res.response.errors[0].longMessage).toBe('some long message');
    // expect(res.response.errors[0].meta.paramName).toBe('some param');
  });

  it('executes a failed backend API request and include cf ray id when trace not present', async () => {
    server.use(
      http.get(
        'https://api.clerk.test/v1/users/:userId',
        validateHeaders(() => HttpResponse.json({ errors: [] }, { status: 500, headers: { 'cf-ray': 'mock_cf_ray' } })),
      ),
    );

    const res = await apiClient.users.get({ userId: 'user_123' }, { retries: { strategy: 'none' } }).catch(err => err);

    expect(res.cause.status).toBe(500);
    expect(res.cause.clerkTraceId).toBe('mock_cf_ray');
  });

  it.skip('retries a failed backend API request', async () => {
    server.use(
      http.get(
        'https://api.clerk.test/v1/users/:userId',
        validateHeaders(() => {
          return HttpResponse.json({ errors: [] }, { status: 500, headers: { 'cf-ray': 'mock_cf_ray' } });
        }),
        { once: true },
      ),
      http.get(
        'https://api.clerk.test/v1/users/:userId',
        validateHeaders(() => HttpResponse.json(userJson)),
      ),
    );

    const res = await apiClient.users
      .get(
        { userId: 'user_123' },
        {
          retries: {
            strategy: 'backoff',
            backoff: {
              initialInterval: 50,
              maxInterval: 100,
              exponent: 0.1,
              maxElapsedTime: 1000,
            },
            retryConnectionErrors: false,
          },
        },
      )
      .catch(err => err);

    // try {
    //   const res = await apiClient.users.get(
    //     { userId: 'user_123' },
    //     { retries:  {
    //       strategy: "backoff",
    //       backoff: {
    //         initialInterval: 50,
    //         maxInterval: 100,
    //         exponent: 0.1,
    //         maxElapsedTime: 1000,
    //       },
    //       retryConnectionErrors: false
    //     }
    //   });

    //   expect(res.id).toBe('user_123');
    // } catch (_) {
    //   throw new Error('Retries are not working');
    // }
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
    const domainId = 'dmn_123';

    server.use(
      http.delete(
        `https://api.clerk.test/v1/domains/:domainId`,
        validateHeaders(() => {
          return HttpResponse.json({
            object: 'domain',
            id: domainId,
            deleted: true,
          });
        }),
      ),
    );

    const res = await apiClient.domains.delete({ domainId });

    expect(res.object).toBe('domain');
    expect(res.id).toBe(domainId);
    expect(res.deleted).toBe(true);
  });

  it('successfully retrieves user access tokens from backend API for a specific provider (with prefix)', async () => {
    const userId = 'user_deadbeef';
    const provider = 'oauth_google';

    server.use(
      http.get(
        'https://api.clerk.test/v1/users/:userId/oauth_access_tokens/:provider',
        validateHeaders(({ request }) => {
          const paginated = new URL(request.url).searchParams.get('paginated');

          if (!paginated) {
            return new HttpResponse(null, { status: 404 });
          }

          return HttpResponse.json([
            {
              object: 'oauth_access_token',
              external_account_id: 'eac_2dYS7stz9bgxQsSRvNqEAHhuxvW',
              provider_user_id: 'foo',
              token: '<token>',
              provider: 'oauth_google',
              public_metadata: {},
              label: null,
              scopes: ['email', 'profile'],
              expires_at: 1742849028,
            },
          ]);

          // TODO: Doesn't return total_count
          // return HttpResponse.json({
          //   data: [
          //     {
          //       external_account_id: 'eac_2dYS7stz9bgxQsSRvNqEAHhuxvW',
          //       object: 'oauth_access_token',
          //       token: '<token>',
          //       provider: 'oauth_google',
          //       public_metadata: {},
          //       label: null,
          //       scopes: ['email', 'profile'],
          //     },
          //   ],
          //   total_count: 1,
          // });
        }),
      ),
    );

    const res = await apiClient.users.getOAuthAccessToken({ userId, provider, paginated: true });

    expect(res[0].externalAccountId).toBe('eac_2dYS7stz9bgxQsSRvNqEAHhuxvW');
    expect(res[0].provider).toBe('oauth_google');
    expect(res[0].token).toBe('<token>');
    expect(res[0].scopes).toEqual(['email', 'profile']);
  });
});
