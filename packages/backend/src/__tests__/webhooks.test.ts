import { beforeEach, describe, expect, it, vi } from 'vitest';

import { verifyWebhook } from '../webhooks';

// Mock svix
vi.mock('svix', () => {
  return {
    Webhook: vi.fn().mockImplementation(() => ({
      verify: vi.fn().mockImplementation(payload => {
        // Return the parsed payload for successful verification
        return JSON.parse(payload);
      }),
    })),
  };
});

describe('verifyWebhook', () => {
  const mockSecret = 'test_signing_secret';
  const mockBody = JSON.stringify({ type: 'user.created', data: { id: 'user_123' } });

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

    await expect(verifyWebhook(mockRequest)).rejects.toThrow('Missing required Svix headers: svix-signature');
  });

  it('throws with all missing headers in error message', async () => {
    const mockRequest = new Request('https://clerk.com/webhooks', {
      method: 'POST',
      body: mockBody,
      headers: new Headers({}),
    });

    await expect(verifyWebhook(mockRequest)).rejects.toThrow(
      'Missing required Svix headers: svix-id, svix-timestamp, svix-signature',
    );
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

    await expect(verifyWebhook(mockRequest)).rejects.toThrow(
      'Missing webhook signing secret. Set the CLERK_WEBHOOK_SIGNING_SECRET environment variable with the webhook secret from the Clerk Dashboard.',
    );
  });

  it('validates webhook request requirements', async () => {
    const mockRequest = new Request('https://clerk.com/webhooks', {
      method: 'POST',
      body: mockBody,
      headers: new Headers({
        'svix-id': 'msg_123',
        'svix-timestamp': '1614265330',
        'svix-signature': 'v1,test_signature',
      }),
    });

    // Call the verifyWebhook function
    const result = await verifyWebhook(mockRequest);

    // Verify that the result matches the expected output
    expect(result).toHaveProperty('type', 'user.created');
    expect(result).toHaveProperty('data.id', 'user_123');
  });
});
