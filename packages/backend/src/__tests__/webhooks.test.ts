import { beforeEach, describe, expect, it } from 'vitest';

import { verifyWebhook } from '../webhooks';

describe('verifyWebhook', () => {
  const mockSecret = 'test_signing_secret';
  const mockBody = JSON.stringify({ type: 'user.created', data: { id: '123' } });

  beforeEach(() => {
    process.env.CLERK_WEBHOOK_SIGNING_SECRET = mockSecret;
  });

  it('throws when required headers are missing', async () => {
    const mockRequest = new Request('https://clerk.com/webhooks', {
      method: 'POST',
      body: mockBody,
      headers: new Headers({
        // Missing svix-signature but with valid format for others
        'svix-id': 'msg_123',
        'svix-timestamp': '1614265330',
      }),
    });

    await expect(verifyWebhook(mockRequest)).rejects.toThrow('@clerk/backend: Missing required Svix headers');
  });

  it('throws when signing secret is missing', async () => {
    delete process.env.CLERK_WEBHOOK_SIGNING_SECRET;

    const mockRequest = new Request('https://clerk.com/webhooks', {
      method: 'POST',
      body: mockBody,
      headers: new Headers({
        'svix-id': 'msg_123',
        'svix-timestamp': '1614265330',
        'svix-signature': 'v1,test_signature',
      }),
    });

    await expect(verifyWebhook(mockRequest)).rejects.toThrow('@clerk/backend: Missing signing secret');
  });

  it('throws when signature verification fails', async () => {
    const mockRequest = new Request('https://clerk.com/webhooks', {
      method: 'POST',
      body: mockBody,
      headers: new Headers({
        'svix-id': 'msg_123',
        'svix-timestamp': '1614265330',
        'svix-signature': 'v1,invalid_signature',
      }),
    });

    await expect(verifyWebhook(mockRequest)).rejects.toThrow();
  });
});
