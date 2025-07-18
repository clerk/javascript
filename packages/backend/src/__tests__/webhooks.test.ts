import { Webhook } from 'standardwebhooks';
import { beforeEach, describe, expect, it } from 'vitest';

import { verifyWebhook } from '../webhooks';

describe('verifyWebhook', () => {
  const mockSecret = 'whsec_' + Buffer.from('test_signing_secret_32_chars_long').toString('base64');
  const mockBody = JSON.stringify({ type: 'user.created', data: { id: 'user_123' } });

  beforeEach(() => {
    process.env.CLERK_WEBHOOK_SIGNING_SECRET = mockSecret;
  });

  // Helper function to create a valid signature with Standard Webhooks
  const createValidSignature = (id: string, timestamp: string, body: string) => {
    const webhook = new Webhook(mockSecret);
    // Create a signature using the Standard Webhooks library
    return webhook.sign(id, new Date(parseInt(timestamp) * 1000), body);
  };

  it('throws when required headers are missing', async () => {
    const mockRequest = new Request('https://clerk.com/webhooks', {
      method: 'POST',
      body: mockBody,
      headers: new Headers({
        // Missing all required headers
      }),
    });

    await expect(verifyWebhook(mockRequest)).rejects.toThrow('Missing required webhook headers');
  });

  it('throws with all missing headers in error message', async () => {
    const mockRequest = new Request('https://clerk.com/webhooks', {
      method: 'POST',
      body: mockBody,
      headers: new Headers({
        // Missing all required headers
      }),
    });

    await expect(verifyWebhook(mockRequest)).rejects.toThrow('svix-id, svix-timestamp, svix-signature');
  });

  it('throws when signing secret is missing', async () => {
    delete process.env.CLERK_WEBHOOK_SIGNING_SECRET;

    const mockRequest = new Request('https://clerk.com/webhooks', {
      method: 'POST',
      body: mockBody,
      headers: new Headers({
        'svix-id': 'msg_123',
        'svix-timestamp': (Date.now() / 1000).toString(),
        'svix-signature': 'v1,test_signature',
      }),
    });

    await expect(verifyWebhook(mockRequest)).rejects.toThrow('Missing webhook signing secret');
  });

  it('validates webhook request requirements', async () => {
    const svixId = 'msg_123';
    const svixTimestamp = (Date.now() / 1000).toString();
    const validSignature = createValidSignature(svixId, svixTimestamp, mockBody);

    const mockRequest = new Request('https://clerk.com/webhooks', {
      method: 'POST',
      body: mockBody,
      headers: new Headers({
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': validSignature,
      }),
    });

    // Call the verifyWebhook function
    const result = await verifyWebhook(mockRequest);

    // Verify that the result matches the expected output
    expect(result).toHaveProperty('type', 'user.created');
    expect(result).toHaveProperty('data.id', 'user_123');
  });

  it('should accept valid signatures', async () => {
    const svixId = 'msg_123';
    const svixTimestamp = (Date.now() / 1000).toString();
    const validSignature = createValidSignature(svixId, svixTimestamp, mockBody);

    const mockRequest = new Request('https://clerk.com/webhooks', {
      method: 'POST',
      body: mockBody,
      headers: new Headers({
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': validSignature,
      }),
    });

    // Should accept and return parsed data
    const result = await verifyWebhook(mockRequest);
    expect(result).toHaveProperty('type', 'user.created');
    expect(result).toHaveProperty('data.id', 'user_123');
  });

  it('should reject invalid signatures', async () => {
    const svixId = 'msg_123';
    const svixTimestamp = (Date.now() / 1000).toString();
    const invalidSignature = 'v1,invalid_signature_here';

    const mockRequest = new Request('https://clerk.com/webhooks', {
      method: 'POST',
      body: mockBody,
      headers: new Headers({
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': invalidSignature,
      }),
    });

    // Should reject invalid signatures
    await expect(verifyWebhook(mockRequest)).rejects.toThrow('No matching signature found');
  });

  it('should handle multiple signatures in header', async () => {
    const svixId = 'msg_123';
    const svixTimestamp = (Date.now() / 1000).toString();
    const validSignature = createValidSignature(svixId, svixTimestamp, mockBody);
    const invalidSignature = 'v1,invalid_signature';

    const mockRequest = new Request('https://clerk.com/webhooks', {
      method: 'POST',
      body: mockBody,
      headers: new Headers({
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': `${invalidSignature} ${validSignature}`,
      }),
    });

    // Should accept if any signature in the list is valid
    const result = await verifyWebhook(mockRequest);
    expect(result).toHaveProperty('type', 'user.created');
    expect(result).toHaveProperty('data.id', 'user_123');
  });

  it('should handle signatures without version prefixes for backward compatibility', async () => {
    const svixId = 'msg_123';
    const svixTimestamp = (Date.now() / 1000).toString();
    // Test with Standard Webhooks generated signature without custom prefix
    const validSignature = createValidSignature(svixId, svixTimestamp, mockBody);

    const mockRequest = new Request('https://clerk.com/webhooks', {
      method: 'POST',
      body: mockBody,
      headers: new Headers({
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': validSignature,
      }),
    });

    // Should accept signatures without version prefixes
    const result = await verifyWebhook(mockRequest);
    expect(result).toHaveProperty('type', 'user.created');
    expect(result).toHaveProperty('data.id', 'user_123');
  });

  it('should verify against Standard Webhooks specification', async () => {
    // Test with proper Clerk webhook format
    const clerkPayload = '{"type":"user.created","data":{"id":"user_123","email":"test@example.com"}}';
    const msgId = 'msg_test123';
    const timestamp = (Date.now() / 1000).toString();

    const validSignature = createValidSignature(msgId, timestamp, clerkPayload);

    const mockRequest = new Request('https://clerk.com/webhooks', {
      method: 'POST',
      body: clerkPayload,
      headers: new Headers({
        'svix-id': msgId,
        'svix-timestamp': timestamp,
        'svix-signature': validSignature,
      }),
    });

    const result = await verifyWebhook(mockRequest, { signingSecret: mockSecret });
    expect(result).toHaveProperty('type', 'user.created');
    expect(result).toHaveProperty('data.id', 'user_123');
  });

  it('should handle whitespace-only header values correctly', async () => {
    const mockRequest = new Request('https://clerk.com/webhooks', {
      method: 'POST',
      body: mockBody,
      headers: new Headers({
        'svix-id': '', // Empty - should be caught
        'svix-timestamp': '   ', // Whitespace - should be caught
        'svix-signature': 'v1,signature',
      }),
    });

    // This should fail because whitespace-only headers should be treated as missing
    await expect(verifyWebhook(mockRequest)).rejects.toThrow('Missing required webhook headers');
  });

  it('should handle mixed empty and whitespace headers correctly', async () => {
    const mockRequest = new Request('https://clerk.com/webhooks', {
      method: 'POST',
      body: mockBody,
      headers: new Headers({
        'svix-id': '  \t  ', // Mixed whitespace and tabs
        'svix-timestamp': '\n', // Newline character
        'svix-signature': '', // Empty string
      }),
    });

    // All should be treated as missing
    await expect(verifyWebhook(mockRequest)).rejects.toThrow('svix-id, svix-timestamp, svix-signature');
  });

  it('should parse event_attributes', async () => {
    const clerkPayload = JSON.stringify({
      type: 'user.created',
      data: { id: 'user_123', email: 'test@example.com' },
      event_attributes: {
        http_request: {
          client_ip: '127.0.0.1',
          user_agent: 'Mozilla/5.0 (Test)',
        },
      },
    });
    const svixId = 'msg_123';
    const svixTimestamp = (Date.now() / 1000).toString();
    const validSignature = createValidSignature(svixId, svixTimestamp, clerkPayload);

    const mockRequest = new Request('https://clerk.com/webhooks', {
      method: 'POST',
      body: clerkPayload,
      headers: new Headers({
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': validSignature,
      }),
    });

    const result = await verifyWebhook(mockRequest, { signingSecret: mockSecret });
    expect(result).toHaveProperty('type', 'user.created');
    expect(result).toHaveProperty('event_attributes.http_request.client_ip', '127.0.0.1');
    expect(result).toHaveProperty('event_attributes.http_request.user_agent', 'Mozilla/5.0 (Test)');
  });
});
