import type { ConfirmControllerOptions } from '@clerk/mosaic/blocks/confirm';
import { useConfirmController } from '@clerk/mosaic/blocks/confirm';
import { Confirmation } from '@clerk/mosaic/blocks/confirmation';
import { Button } from '@clerk/mosaic/components/button';
import React from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './confirmation.stories?raw';

export const meta: StoryMeta = {
  group: 'Blocks',
  status: 'stable',
  title: 'Confirmation',
  source: 'packages/mosaic/src/blocks/confirmation/confirmation.tsx',
};

// A real removal is a network round trip. Without one the action never renders its pending
// state, so the stories wait before they settle.
const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const trigger = (
  <Button
    color='negative'
    variant='outline'
  >
    Remove
  </Button>
);

function Example(options: ConfirmControllerOptions) {
  const remove = useConfirmController(options);
  return (
    <Confirmation
      controller={remove}
      trigger={trigger}
      title='Remove connected account'
      description='Google will be removed from this account. You will no longer be able to use this connected account and any dependent features will no longer work.'
      actionLabel='Remove'
    />
  );
}

/**
 * The controller owns the dialog. Resolve `onConfirm` and it closes.
 */
export function Default() {
  return <Example onConfirm={() => settleAfter(2000)} />;
}

/**
 * Reject `onConfirm` and the dialog stays up. A Clerk error is localized by its code; anything
 * else renders as `errorFallback`.
 */
export function WithError() {
  return (
    <Example
      onConfirm={async () => {
        await settleAfter(2000);
        throw new Error('internal');
      }}
      errorFallback='Google is your only way to sign in. Add a password or another account first.'
    />
  );
}

interface ConnectedAccount {
  id: string;
  provider: string;
}

const describeRemoval = (account: ConnectedAccount) => (
  <>
    <strong>{account.provider}</strong> will be removed from this account. You will no longer be able to use this
    connected account and any dependent features will no longer work.
  </>
);

/**
 * One block for many rows. `remove.open(account)` opens it with the account it is about, the copy
 * reads that payload, and `onConfirm` receives it back.
 */
export function WithPayload() {
  const [accounts, setAccounts] = React.useState<ConnectedAccount[]>([
    { id: 'eac_1', provider: 'Google' },
    { id: 'eac_2', provider: 'GitHub' },
    { id: 'eac_3', provider: 'Microsoft' },
  ]);

  const remove = useConfirmController<ConnectedAccount>({
    onConfirm: async account => {
      await settleAfter(2000);
      if (account.provider === 'Google') {
        throw new Error('internal');
      }
      setAccounts(current => current.filter(item => item.id !== account.id));
    },
    errorFallback: 'Google is your only way to sign in. Add a password or another account first.',
  });

  return (
    <>
      <ul style={{ display: 'grid', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
        {accounts.map(account => (
          <li
            key={account.id}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
          >
            {account.provider}
            <Button
              color='negative'
              variant='outline'
              onClick={() => remove.open(account)}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
      <Confirmation
        controller={remove}
        title='Remove connected account'
        description={describeRemoval}
        actionLabel='Remove'
      />
    </>
  );
}
