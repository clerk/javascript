import type { ClerkError } from '@clerk/shared/error';
import type { JoinWaitlistParams, WaitlistFutureResource, WaitlistJSON, WaitlistResource } from '@clerk/shared/types';

import { unixEpochToDate } from '../../utils/date';
import { runAsyncResourceTask } from '../../utils/runAsyncResourceTask';
import { eventBus } from '../events';
import { BaseResource } from './internal';

export class Waitlist extends BaseResource implements WaitlistResource {
  pathRoot = '/waitlist';

  id = '';
  updatedAt: Date | null = null;
  createdAt: Date | null = null;

  /**
   * @experimental This experimental API is subject to change.
   *
   * An instance of `WaitlistFuture`, which has a different API than `Waitlist`, intended to be used in custom flows.
   */
  __internal_future: WaitlistFuture = new WaitlistFuture(this);

  /**
   * @internal Only used for internal purposes, and is not intended to be used directly.
   *
   * This property is used to provide access to underlying Client methods to `WaitlistFuture`, which wraps an instance
   * of `Waitlist`.
   */
  __internal_basePost = this._basePost.bind(this);

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

  static async join(params: JoinWaitlistParams): Promise<WaitlistResource> {
    const json = (
      await BaseResource._fetch<WaitlistJSON>({
        path: '/waitlist',
        method: 'POST',
        body: params as any,
      })
    )?.response as unknown as WaitlistJSON;

    return new Waitlist(json);
  }
}

class WaitlistFuture implements WaitlistFutureResource {
  constructor(readonly resource: Waitlist) {}

  get id() {
    return this.resource.id || undefined;
  }

  get createdAt() {
    return this.resource.createdAt;
  }

  get updatedAt() {
    return this.resource.updatedAt;
  }

  async join(params: JoinWaitlistParams): Promise<{ error: ClerkError | null }> {
    return runAsyncResourceTask(this.resource, async () => {
      await this.resource.__internal_basePost({
        path: this.resource.pathRoot,
        body: params,
      });
    });
  }
}
