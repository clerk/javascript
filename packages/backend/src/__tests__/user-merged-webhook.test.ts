import { describe, expectTypeOf, test } from 'vitest';

import type { UserJSON, UserWebhookEvent, WebhookEventType } from '../index';
import type { verifyWebhook } from '../webhooks';

type VerifiedEvent = Awaited<ReturnType<typeof verifyWebhook>>;

describe('user.merged webhook', () => {
  test('is a user webhook event type', () => {
    expectTypeOf<'user.merged'>().toExtend<WebhookEventType>();
    expectTypeOf<'user.merged'>().toExtend<UserWebhookEvent['type']>();
  });

  test('narrows to the remaining user and the deleted user', () => {
    type Merged = Extract<VerifiedEvent, { type: 'user.merged' }>;
    expectTypeOf<Merged['data']['user']>().toEqualTypeOf<UserJSON>();
    expectTypeOf<Merged['data']['deleted_user']>().toEqualTypeOf<UserJSON>();
  });

  test('preserves the common resource ID used by existing webhook handlers', () => {
    expectTypeOf<VerifiedEvent['data']['id']>().toEqualTypeOf<string | undefined>();
  });
});
