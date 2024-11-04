import type { JoinWaitlistParams, WaitlistJSON, WaitlistResource } from '@clerk/types';

import { unixEpochToDate } from '../../utils/date';
import { BaseResource } from './internal';

export class Waitlist extends BaseResource implements WaitlistResource {
  pathRoot = '/waitlist';

  id = '';
  updatedAt: Date | null = null;
  createdAt: Date | null = null;

  constructor(data: WaitlistJSON) {
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
