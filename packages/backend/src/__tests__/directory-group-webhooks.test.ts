import { describe, expectTypeOf, test } from 'vitest';

import type { DirectoryGroupMembershipWebhookEvent, DirectoryGroupWebhookEvent, WebhookEventType } from '../index';
import type { verifyWebhook } from '../webhooks';

type VerifiedEvent = Awaited<ReturnType<typeof verifyWebhook>>;

describe('directory group webhooks', () => {
  test('are part of the verified event union', () => {
    expectTypeOf<DirectoryGroupWebhookEvent>().toMatchTypeOf<VerifiedEvent>();
    expectTypeOf<DirectoryGroupMembershipWebhookEvent>().toMatchTypeOf<VerifiedEvent>();
    expectTypeOf<'directoryGroup.deleted'>().toMatchTypeOf<WebhookEventType>();
    expectTypeOf<'directoryGroupMembership.deleted'>().toMatchTypeOf<WebhookEventType>();
  });

  test('only the membership deletion carries a cause', () => {
    type Deleted = Extract<VerifiedEvent, { type: 'directoryGroupMembership.deleted' }>;
    type Created = Extract<VerifiedEvent, { type: 'directoryGroupMembership.created' }>;
    expectTypeOf<Deleted['data']['cause']>().toEqualTypeOf<'group_deleted' | 'member_removed'>();
    expectTypeOf<Created['data']>().not.toHaveProperty('cause');
    expectTypeOf<Deleted['data']['user_id']>().toEqualTypeOf<string | null>();
  });

  test('preserve the common resource ID used by existing webhook handlers', () => {
    expectTypeOf<VerifiedEvent['data']['id']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<DirectoryGroupWebhookEvent['data']['id']>().toEqualTypeOf<string>();
  });
});
