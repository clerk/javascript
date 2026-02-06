import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('UserAPI', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    secretKey: 'deadbeef',
  });

  describe('getUserList', () => {
    const mockUserResponse = {
      id: 'user_123',
      first_name: 'John',
      last_name: 'Doe',
      email_addresses: [],
      phone_numbers: [],
      web3_wallets: [],
      username: null,
      profile_image_url: 'https://example.com/image.jpg',
      created_at: 1234567890,
      updated_at: 1234567890,
    };

    it('successfully fetches users with lastActiveAtBefore parameter', async () => {
      const lastActiveAtBefore = 1700690400000;

      server.use(
        http.get(
          'https://api.clerk.test/v1/users',
          validateHeaders(({ request }) => {
            const url = new URL(request.url);
            expect(url.searchParams.get('last_active_at_before')).toBe(lastActiveAtBefore.toString());
            return HttpResponse.json([mockUserResponse]);
          }),
        ),
        http.get(
          'https://api.clerk.test/v1/users/count',
          validateHeaders(() => HttpResponse.json({ object: 'total_count', total_count: 1 })),
        ),
      );

      const response = await apiClient.users.getUserList({
        lastActiveAtBefore,
      });

      expect(response.data).toHaveLength(1);
      expect(response.totalCount).toBe(1);
    });

    it('successfully fetches users with lastActiveAtAfter parameter', async () => {
      const lastActiveAtAfter = 1700690400000;

      server.use(
        http.get(
          'https://api.clerk.test/v1/users',
          validateHeaders(({ request }) => {
            const url = new URL(request.url);
            expect(url.searchParams.get('last_active_at_after')).toBe(lastActiveAtAfter.toString());
            return HttpResponse.json([mockUserResponse]);
          }),
        ),
        http.get(
          'https://api.clerk.test/v1/users/count',
          validateHeaders(() => HttpResponse.json({ object: 'total_count', total_count: 1 })),
        ),
      );

      const response = await apiClient.users.getUserList({
        lastActiveAtAfter,
      });

      expect(response.data).toHaveLength(1);
      expect(response.totalCount).toBe(1);
    });

    it('successfully fetches users with createdAtBefore parameter', async () => {
      const createdAtBefore = 1730160000000;

      server.use(
        http.get(
          'https://api.clerk.test/v1/users',
          validateHeaders(({ request }) => {
            const url = new URL(request.url);
            expect(url.searchParams.get('created_at_before')).toBe(createdAtBefore.toString());
            return HttpResponse.json([mockUserResponse]);
          }),
        ),
        http.get(
          'https://api.clerk.test/v1/users/count',
          validateHeaders(() => HttpResponse.json({ object: 'total_count', total_count: 1 })),
        ),
      );

      const response = await apiClient.users.getUserList({
        createdAtBefore,
      });

      expect(response.data).toHaveLength(1);
      expect(response.totalCount).toBe(1);
    });

    it('successfully fetches users with createdAtAfter parameter', async () => {
      const createdAtAfter = 1730160000000;

      server.use(
        http.get(
          'https://api.clerk.test/v1/users',
          validateHeaders(({ request }) => {
            const url = new URL(request.url);
            expect(url.searchParams.get('created_at_after')).toBe(createdAtAfter.toString());
            return HttpResponse.json([mockUserResponse]);
          }),
        ),
        http.get(
          'https://api.clerk.test/v1/users/count',
          validateHeaders(() => HttpResponse.json({ object: 'total_count', total_count: 1 })),
        ),
      );

      const response = await apiClient.users.getUserList({
        createdAtAfter,
      });

      expect(response.data).toHaveLength(1);
      expect(response.totalCount).toBe(1);
    });

    it('successfully fetches users with multiple date filters combined', async () => {
      const lastActiveAtBefore = 1700690400000;
      const lastActiveAtAfter = 1700000000000;
      const createdAtBefore = 1730160000000;
      const createdAtAfter = 1729000000000;

      server.use(
        http.get(
          'https://api.clerk.test/v1/users',
          validateHeaders(({ request }) => {
            const url = new URL(request.url);
            expect(url.searchParams.get('last_active_at_before')).toBe(lastActiveAtBefore.toString());
            expect(url.searchParams.get('last_active_at_after')).toBe(lastActiveAtAfter.toString());
            expect(url.searchParams.get('created_at_before')).toBe(createdAtBefore.toString());
            expect(url.searchParams.get('created_at_after')).toBe(createdAtAfter.toString());
            return HttpResponse.json([mockUserResponse]);
          }),
        ),
        http.get(
          'https://api.clerk.test/v1/users/count',
          validateHeaders(() => HttpResponse.json({ object: 'total_count', total_count: 1 })),
        ),
      );

      const response = await apiClient.users.getUserList({
        lastActiveAtBefore,
        lastActiveAtAfter,
        createdAtBefore,
        createdAtAfter,
      });

      expect(response.data).toHaveLength(1);
      expect(response.totalCount).toBe(1);
    });

    it('successfully fetches users with deprecated last_active_at_since parameter', async () => {
      const last_active_at_since = 1700690400000;

      server.use(
        http.get(
          'https://api.clerk.test/v1/users',
          validateHeaders(({ request }) => {
            const url = new URL(request.url);
            expect(url.searchParams.get('last_active_at_since')).toBe(last_active_at_since.toString());
            return HttpResponse.json([mockUserResponse]);
          }),
        ),
        http.get(
          'https://api.clerk.test/v1/users/count',
          validateHeaders(() => HttpResponse.json({ object: 'total_count', total_count: 1 })),
        ),
      );

      const response = await apiClient.users.getUserList({
        last_active_at_since,
      });

      expect(response.data).toHaveLength(1);
      expect(response.totalCount).toBe(1);
    });

    it('successfully fetches users with pagination and date filters', async () => {
      const limit = 10;
      const offset = 20;
      const createdAtAfter = 1730160000000;

      server.use(
        http.get(
          'https://api.clerk.test/v1/users',
          validateHeaders(({ request }) => {
            const url = new URL(request.url);
            expect(url.searchParams.get('limit')).toBe(limit.toString());
            expect(url.searchParams.get('offset')).toBe(offset.toString());
            expect(url.searchParams.get('created_at_after')).toBe(createdAtAfter.toString());
            return HttpResponse.json([mockUserResponse]);
          }),
        ),
        http.get(
          'https://api.clerk.test/v1/users/count',
          validateHeaders(() => HttpResponse.json({ object: 'total_count', total_count: 1 })),
        ),
      );

      const response = await apiClient.users.getUserList({
        limit,
        offset,
        createdAtAfter,
      });

      expect(response.data).toHaveLength(1);
      expect(response.totalCount).toBe(1);
    });

    it('successfully fetches users with orderBy and date filters', async () => {
      const orderBy = '-created_at';
      const lastActiveAtAfter = 1700690400000;

      server.use(
        http.get(
          'https://api.clerk.test/v1/users',
          validateHeaders(({ request }) => {
            const url = new URL(request.url);
            expect(url.searchParams.get('order_by')).toBe(orderBy);
            expect(url.searchParams.get('last_active_at_after')).toBe(lastActiveAtAfter.toString());
            return HttpResponse.json([mockUserResponse]);
          }),
        ),
        http.get(
          'https://api.clerk.test/v1/users/count',
          validateHeaders(() => HttpResponse.json({ object: 'total_count', total_count: 1 })),
        ),
      );

      const response = await apiClient.users.getUserList({
        orderBy,
        lastActiveAtAfter,
      });

      expect(response.data).toHaveLength(1);
      expect(response.totalCount).toBe(1);
    });
  });
});
