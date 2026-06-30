import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server, validateHeaders } from '../../mock-server';
import { createBackendApiClient } from '../factory';

describe('EmailApi', () => {
  const apiClient = createBackendApiClient({
    apiUrl: 'https://api.clerk.test',
    secretKey: 'deadbeef',
  });

  const mockEmail = {
    object: 'email',
    id: 'ema_123',
    slug: null,
    from_email_name: 'noreply',
    reply_to_email_name: null,
    to_email_address: 'admin@acme.com',
    email_address_id: null,
    user_id: null,
    subject: 'Hello',
    body: '<p>hi</p>',
    body_plain: null,
    status: 'queued',
    data: null,
    delivered_by_clerk: true,
  };

  it('sends a transactional email and snake_cases the body', async () => {
    server.use(
      http.post(
        'https://api.clerk.test/v1/email',
        validateHeaders(async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({
            to: { address: 'admin@acme.com' },
            from: { address: 'noreply@acme.com' },
            reply_to: { address: 'support@acme.com' },
            subject: 'Hello',
            html: '<p>hi</p>',
          });
          return HttpResponse.json(mockEmail);
        }),
      ),
    );

    const response = await apiClient.emails.create({
      to: { address: 'admin@acme.com' },
      from: { address: 'noreply@acme.com' },
      replyTo: { address: 'support@acme.com' },
      subject: 'Hello',
      html: '<p>hi</p>',
    });

    expect(response.id).toBe('ema_123');
    expect(response.toEmailAddress).toBe('admin@acme.com');
    expect(response.status).toBe('queued');
    expect(response.deliveredByClerk).toBe(true);
  });

  it('sends a transactional email with a text body', async () => {
    server.use(
      http.post(
        'https://api.clerk.test/v1/email',
        validateHeaders(async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({
            to: { address: 'admin@acme.com' },
            from: { address: 'noreply@acme.com' },
            subject: 'Hello',
            text: 'hi',
          });
          return HttpResponse.json({
            ...mockEmail,
            body: null,
            body_plain: 'hi',
          });
        }),
      ),
    );

    const response = await apiClient.emails.create({
      to: { address: 'admin@acme.com' },
      from: { address: 'noreply@acme.com' },
      subject: 'Hello',
      text: 'hi',
    });

    expect(response.id).toBe('ema_123');
    expect(response.body).toBeNull();
    expect(response.bodyPlain).toBe('hi');
    expect(response.status).toBe('queued');
  });

  it('sends a transactional email addressed by userId', async () => {
    server.use(
      http.post(
        'https://api.clerk.test/v1/email',
        validateHeaders(async ({ request }) => {
          const body = await request.json();
          // The nested `userId` must be snake_cased to `user_id` on the wire.
          expect(body).toEqual({
            to: { user_id: 'user_123' },
            from: { address: 'noreply@acme.com' },
            subject: 'Hello',
            html: '<p>hi</p>',
          });
          return HttpResponse.json({
            ...mockEmail,
            to_email_address: 'member@acme.com',
            email_address_id: 'idn_123',
            user_id: 'user_123',
          });
        }),
      ),
    );

    const response = await apiClient.emails.create({
      to: { userId: 'user_123' },
      from: { address: 'noreply@acme.com' },
      subject: 'Hello',
      html: '<p>hi</p>',
    });

    expect(response.toEmailAddress).toBe('member@acme.com');
    expect(response.emailAddressId).toBe('idn_123');
    expect(response.userId).toBe('user_123');
  });
});
