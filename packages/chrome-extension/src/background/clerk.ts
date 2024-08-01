import { Clerk } from '@clerk/clerk-js';

import { createClerkClient, type CreateClerkClientOptions as _CreateClerkClientOptions } from '../internal';
import { SCOPE } from '../types';

export type CreateClerkClientOptions = Omit<_CreateClerkClientOptions, 'scope'>;

export let clerk: Clerk;

export async function __unstable__createClerkClient(opts: CreateClerkClientOptions): Promise<Clerk> {
  if (clerk) {
    return clerk;
  }

  Clerk.mountComponentRenderer = undefined;
  clerk = await createClerkClient({ ...opts, scope: SCOPE.background });
  await clerk.load({ standardBrowser: false });

  return clerk;
}
