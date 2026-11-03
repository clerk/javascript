import { describe, test } from 'vitest';

import { createDialogHandle } from './dialog-handle';

describe('DialogHandle.open', () => {
  test('a handle that carries a payload requires it', () => {
    const handle = createDialogHandle<string>();

    handle.open('a');
    // @ts-expect-error -- The dialog would open about nothing
    handle.open();
    // @ts-expect-error -- The dialog would open about nothing
    handle.open(undefined);
    // @ts-expect-error -- Not the payload this handle carries
    handle.open(1);
  });

  test('a handle with no required payload opens without one', () => {
    createDialogHandle().open();
    createDialogHandle<string | undefined>().open(undefined);
  });
});
