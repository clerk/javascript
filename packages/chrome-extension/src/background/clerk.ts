import { Clerk } from '@clerk/clerk-js';

import {
  createClerkClient as _createClerkClient,
  type CreateClerkClientOptions as _CreateClerkClientOptions,
} from '../internal';
import { SCOPE } from '../types';

export type CreateClerkClientOptions = Omit<_CreateClerkClientOptions, 'scope'>;

export let clerk: Clerk;

export async function createClerkClient(opts: CreateClerkClientOptions): Promise<Clerk> {
  if (clerk) {
    return clerk;
  }

  Clerk.mountComponentRenderer = undefined;
  clerk = await _createClerkClient({ ...opts, scope: SCOPE.BACKGROUND });
  await clerk.load({ standardBrowser: false });

  return clerk;
}
