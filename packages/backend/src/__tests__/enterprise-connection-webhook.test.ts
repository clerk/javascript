import { describe, expectTypeOf, test } from 'vitest';

import type { EnterpriseConnectionWebhookEvent, WebhookEventType } from '../index';
import type { verifyWebhook } from '../webhooks';

type VerifiedEvent = Awaited<ReturnType<typeof verifyWebhook>>;

describe('enterpriseConnection.created webhook', () => {
  test('is part of the verified event union', () => {
    expectTypeOf<EnterpriseConnectionWebhookEvent>().toExtend<VerifiedEvent>();
    expectTypeOf<'enterpriseConnection.created'>().toExtend<WebhookEventType>();
  });

  test('narrows to the enterprise connection payload', () => {
    type Created = Extract<VerifiedEvent, { type: 'enterpriseConnection.created' }>;
    // Compare against the literal wire shape, so a changed or dropped field fails
    expectTypeOf<Created['data']>().toEqualTypeOf<{
      object: 'enterprise_connection';
      id: string;
      organization_id: string | null;
      domains: string[];
      active: boolean;
      created_at: number;
    }>();
  });

  test('preserves the common resource ID used by existing webhook handlers', () => {
    expectTypeOf<VerifiedEvent['data']['id']>().toEqualTypeOf<string | undefined>();
  });
});
