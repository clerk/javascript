import { Clerk } from '@clerk/clerk-js/no-rhc';

import {
  createClerkClient as _createClerkClient,
  type CreateClerkClientOptions as _CreateClerkClientOptions,
} from '../internal';
import { SCOPE } from '../types';

Clerk.mountComponentRenderer = undefined;

export type CreateClerkClientOptions = Omit<_CreateClerkClientOptions, 'scope'>;

export async function createClerkClient(opts: CreateClerkClientOptions): Promise<Clerk> {
  const clerk = await _createClerkClient({ ...opts, scope: SCOPE.BACKGROUND });
  await clerk.load({ standardBrowser: false });
  return clerk;
}
