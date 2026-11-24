import { describe, expectTypeOf, test } from 'vitest';

import type {
  EnterpriseConnectionWebhookEvent,
  EnterpriseConnectionWebhookEventJSON,
  WebhookEventType,
} from '../index';
import type { verifyWebhook } from '../webhooks';

type VerifiedEvent = Awaited<ReturnType<typeof verifyWebhook>>;

describe('enterpriseConnection.created webhook', () => {
  test('is part of the verified event union', () => {
    expectTypeOf<EnterpriseConnectionWebhookEvent>().toExtend<VerifiedEvent>();
    expectTypeOf<'enterpriseConnection.created'>().toExtend<WebhookEventType>();
  });

  test('narrows to the enterprise connection payload', () => {
    type Created = Extract<VerifiedEvent, { type: 'enterpriseConnection.created' }>;
    expectTypeOf<Created['data']>().toEqualTypeOf<EnterpriseConnectionWebhookEventJSON>();
    expectTypeOf<Created['data']['organization_id']>().toEqualTypeOf<string | null>();
  });

  test('preserves the common resource ID used by existing webhook handlers', () => {
    expectTypeOf<VerifiedEvent['data']['id']>().toEqualTypeOf<string | undefined>();
  });
});
