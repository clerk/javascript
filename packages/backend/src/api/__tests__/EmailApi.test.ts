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
});
