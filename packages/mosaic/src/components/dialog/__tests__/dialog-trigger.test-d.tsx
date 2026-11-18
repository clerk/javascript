import { describe, test } from 'vitest';

import { Dialog } from '../index';

describe('Dialog.Trigger payload', () => {
  test('a detached trigger must pass the payload its handle carries', () => {
    const handle = Dialog.createHandle<string>();
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
        <Dialog.Trigger handle={Dialog.createHandle()} />
        <Dialog.Trigger handle={Dialog.createHandle<void>()} />
        <Dialog.Trigger handle={Dialog.createHandle<unknown>()} />
        <Dialog.Trigger />
      </>
    );
  });
});
