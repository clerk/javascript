import type { JoinWaitlistParams, WaitlistJSON, WaitlistResource } from '@clerk/types';

import { BaseResource } from './internal';
import { parseJSON } from './parser';

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
    Object.assign(
      this,
      parseJSON<Waitlist>(data, {
        dateFields: ['updatedAt', 'createdAt'],
      }),
    );
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
