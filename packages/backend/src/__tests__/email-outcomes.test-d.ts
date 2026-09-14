import { describe, expectTypeOf, test } from 'vitest';

import type { EmailBounceType, EmailDeliveryWebhookEvent, EmailWebhookEvent, WebhookEvent } from '../index';
import type { verifyWebhook } from '../webhooks';

describe('transactional email outcome webhooks', () => {
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

  test('requires explicit bounce classification', () => {
    type Bounced = Extract<EmailDeliveryWebhookEvent, { type: 'email.bounced' }>;
    // @ts-expect-error A failed send does not establish a permanent bounce.
    const bounce: Bounced['data']['bounce'] = { type: 'failed', message: 'Failed to send' };
    expectTypeOf(bounce).toEqualTypeOf<Bounced['data']['bounce']>();
  });
});
