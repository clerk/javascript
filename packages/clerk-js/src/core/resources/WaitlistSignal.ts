import type { JoinWaitlistParams } from '@clerk/types';

import { runAsyncResourceTask } from '../../utils/runAsyncResourceTask';
import { BaseResource } from './internal';

// Internal lightweight resource used to proxy waitlist actions through the signal system.
export class WaitlistSignalResource extends BaseResource {
  pathRoot = '/waitlist';

  // Not used for snapshots/updates; kept for BaseResource contract compatibility
  protected fromJSON(_data: null): this {
    return this;
  }

  async join(params: JoinWaitlistParams): Promise<{ error: unknown }> {
    return runAsyncResourceTask(this, async () => {
      await BaseResource.clerk.joinWaitlist(params);
    });
  }
}
