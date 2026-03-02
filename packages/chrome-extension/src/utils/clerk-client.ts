import { Clerk } from '@clerk/clerk-js/no-rhc';

import {
  createClerkClient as _createClerkClient,
  type CreateClerkClientOptions as _CreateClerkClientOptions,
} from '../internal';
import { SCOPE } from '../types';

export type CreateClerkClientOptions = Omit<_CreateClerkClientOptions, 'scope'> & {
  background?: boolean;
};

export function createClerkClient(opts: CreateClerkClientOptions & { background: true }): Promise<Clerk>;
export function createClerkClient(opts: Omit<CreateClerkClientOptions, 'background'>): Clerk;
export function createClerkClient(opts: CreateClerkClientOptions): Clerk | Promise<Clerk> {
  if (opts.background) {
    const { background: _, ...rest } = opts;
    return _createClerkClient({ ...rest, scope: SCOPE.BACKGROUND }).then(clerk =>
      clerk.load({ standardBrowser: false }).then(() => clerk),
    );
  }

  Clerk.sdkMetadata = {
    name: PACKAGE_NAME,
    version: PACKAGE_VERSION,
  };

  const clerk = new Clerk(opts.publishableKey, {});

  return clerk;
}
