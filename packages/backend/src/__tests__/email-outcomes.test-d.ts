import { describe, expectTypeOf, test } from 'vitest';

import type { EmailBounceType, EmailDeliveryWebhookEvent, EmailWebhookEvent, WebhookEvent } from '../index';
import type { verifyWebhook } from '../webhooks';

describe('transactional email outcome webhooks', () => {
  test('preserves the common resource ID used by existing webhook handlers', () => {
    type VerifiedEvent = Awaited<ReturnType<typeof verifyWebhook>>;
    expectTypeOf<VerifiedEvent['data']['id']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<EmailDeliveryWebhookEvent['data']['id']>().toEqualTypeOf<string>();
  });

  test('narrows the bounce classification', () => {
    type Bounced = Extract<Awaited<ReturnType<typeof verifyWebhook>>, { type: 'email.bounced' }>;
    expectTypeOf<Bounced['data']['bounce']['type']>().toEqualTypeOf<EmailBounceType>();
    expectTypeOf<Bounced['data']['to']>().toEqualTypeOf<[string]>();
    expectTypeOf<Bounced['timestamp']>().toEqualTypeOf<number>();
    expectTypeOf<Bounced['event_attributes']>().toEqualTypeOf<null>();
  });

  test('keeps existing email.created types separate', () => {
    expectTypeOf<EmailWebhookEvent['type']>().toEqualTypeOf<'email.created'>();
    expectTypeOf<EmailDeliveryWebhookEvent>().toExtend<WebhookEvent>();
  });

  test('distinguishes Clerk policy suppression from provider suppression', () => {
    type Suppressed = Extract<EmailDeliveryWebhookEvent, { type: 'email.suppressed' }>;
    type Policy = Extract<Suppressed['data']['suppressed'], { type: 'ClerkPolicy' }>;
    expectTypeOf<Policy['reason']>().toEqualTypeOf<
      'unverified_email_dns' | 'provider_domain_restriction' | 'application_communication_lock'
    >();
    type Failed = Extract<EmailDeliveryWebhookEvent, { type: 'email.failed' }>;
    expectTypeOf<Failed['data']['failed']['reason']>().toEqualTypeOf<
      'provider_rejected' | 'delivery_retry_exhausted' | 'send_retry_exhausted'
    >();
  });

  test('requires explicit bounce classification', () => {
    type Bounced = Extract<EmailDeliveryWebhookEvent, { type: 'email.bounced' }>;
    // @ts-expect-error A failed send does not establish a permanent bounce.
    const bounce: Bounced['data']['bounce'] = { type: 'failed', message: 'Failed to send' };
    expectTypeOf(bounce).toEqualTypeOf<Bounced['data']['bounce']>();
  });
});
