import type { NextApiRequest } from 'next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RequestLike } from '../server/types';
import { verifyWebhook } from '../webhooks';

const mockSuccessResponse = {
  type: 'user.created',
  data: { id: 'user_123' },
  object: 'event',
} as any;

const mockError = new Error('Missing required Svix headers: svix-id, svix-timestamp, svix-signature');

vi.mock('@clerk/backend/webhooks', () => ({
  verifyWebhook: vi.fn().mockImplementation((request: Request) => {
    const svixId = request.headers.get('svix-id');
    const svixTimestamp = request.headers.get('svix-timestamp');
    const svixSignature = request.headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw mockError;
    }

    return mockSuccessResponse;
  }),
}));

describe('verifyWebhook', () => {
  const mockSecret = 'test_signing_secret';
  const mockBody = JSON.stringify(mockSuccessResponse);
  const mockHeaders = {
    'svix-id': 'msg_123',
    'svix-timestamp': '1614265330',
    'svix-signature': 'v1,test_signature',
  };

  beforeEach(() => {
    process.env.CLERK_WEBHOOK_SIGNING_SECRET = mockSecret;
  });

  describe('with standard Request', () => {
    it('verifies webhook with standard Request object', async () => {
      const mockRequest = new Request('https://clerk.com/webhooks', {
        method: 'POST',
        body: mockBody,
        headers: new Headers(mockHeaders),
      }) as unknown as RequestLike;

      const result = await verifyWebhook(mockRequest);
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('with NextApiRequest', () => {
    it('verifies webhook with NextApiRequest object', async () => {
      const mockNextApiRequest = {
        method: 'POST',
        url: '/webhooks',
        headers: {
          ...mockHeaders,
          host: 'clerk.com',
          'x-forwarded-proto': 'https',
        },
        body: JSON.parse(mockBody),
        query: {},
        cookies: {},
        env: {},
        aborted: false,
      } as unknown as NextApiRequest;

      const result = await verifyWebhook(mockNextApiRequest);
      expect(result).toEqual(mockSuccessResponse);
    });

    it('throws error when headers are missing', async () => {
      const mockNextApiRequest = {
        method: 'POST',
        url: '/webhooks',
        headers: {
          host: 'clerk.com',
          'x-forwarded-proto': 'https',
        },
        body: JSON.parse(mockBody),
        query: {},
        cookies: {},
        env: {},
        aborted: false,
      } as unknown as NextApiRequest;

      await expect(verifyWebhook(mockNextApiRequest)).rejects.toThrow(mockError);
    });
  });
});
