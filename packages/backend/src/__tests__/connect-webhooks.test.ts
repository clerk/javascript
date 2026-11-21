import { describe, expectTypeOf, test } from 'vitest';

import type { ConnectionWebhookEvent, ConnectionWebhookEventJSON, WebhookEventType } from '../index';
import type { verifyWebhook } from '../webhooks';

type VerifiedEvent = Awaited<ReturnType<typeof verifyWebhook>>;

describe('Clerk Connect webhooks', () => {
  test('are part of the verified event union', () => {
    expectTypeOf<ConnectionWebhookEvent>().toMatchTypeOf<VerifiedEvent>();
    expectTypeOf<'connection.created'>().toMatchTypeOf<WebhookEventType>();
    expectTypeOf<'connection.updated'>().toMatchTypeOf<WebhookEventType>();
    expectTypeOf<'connection.deleted'>().toMatchTypeOf<WebhookEventType>();
  });

  test('narrow to the connection payload, without credentials', () => {
    const handle = (evt: VerifiedEvent) => {
      if (evt.type === 'connection.updated') {
        expectTypeOf(evt.data).toEqualTypeOf<ConnectionWebhookEventJSON>();
        expectTypeOf(evt.data.connector_status).toEqualTypeOf<'active' | 'disabled'>();
      }
    };
    expectTypeOf(handle).toBeFunction();
    expectTypeOf<ConnectionWebhookEventJSON>().not.toHaveProperty('access_token');
  });
});
