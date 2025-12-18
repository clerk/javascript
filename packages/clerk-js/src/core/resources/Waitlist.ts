import type { ClerkError } from '@clerk/shared/error';
import type { JoinWaitlistParams, WaitlistJSON, WaitlistResource } from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { runAsyncResourceTask } from '../../utils/runAsyncResourceTask';
import { eventBus } from '../events';
import { BaseResource } from './internal';

export class Waitlist extends BaseResource implements WaitlistResource {
  pathRoot = '/waitlist';

  id = '';
  updatedAt: Date | null = null;
  createdAt: Date | null = null;

  constructor(data: WaitlistJSON | null = null) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: WaitlistJSON | null): this {
    if (!data) {
      return this;
    }

    this.id = data.id;
    this.updatedAt = unixEpochToDate(data.updated_at);
    this.createdAt = unixEpochToDate(data.created_at);

    eventBus.emit('resource:update', { resource: this });
    return this;
  }

  async join(params: JoinWaitlistParams): Promise<{ error: ClerkError | null }> {
    return runAsyncResourceTask(this, async () => {
      await Waitlist.join(params);
    });
  }

  static async join(params: JoinWaitlistParams): Promise<WaitlistResource> {
    const json = await BaseResource._fetch<WaitlistJSON>({
      path: '/waitlist',
      method: 'POST',
      body: params as any,
    });

    return new Waitlist(json as unknown as WaitlistJSON);
  }
}
