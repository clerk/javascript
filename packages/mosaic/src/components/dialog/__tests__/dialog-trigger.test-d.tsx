import { describe, test } from 'vitest';

import { Dialog } from '../index';

describe('Dialog.Trigger payload', () => {
  test('a detached trigger must pass the payload its handle carries', () => {
    const handle = Dialog.createDialogHandle<string>();
    void (
      <>
        <Dialog.Trigger
          handle={handle}
          payload='a'
        />
        {/* @ts-expect-error -- The root would open with no payload */}
        <Dialog.Trigger handle={handle} />
      </>
    );
  });

  test('a trigger whose handle carries no payload may omit it', () => {
    void (
      <>
        <Dialog.Trigger handle={Dialog.createDialogHandle()} />
        <Dialog.Trigger handle={Dialog.createDialogHandle<void>()} />
        <Dialog.Trigger handle={Dialog.createDialogHandle<unknown>()} />
        <Dialog.Trigger />
      </>
    );
  });
});
