import { describe, expectTypeOf, test } from 'vitest';

import type { Dialog, DialogRootProps, DialogTriggerProps } from '.';

describe('Dialog part types', () => {
  test('generic part namespaces pass their type argument through', () => {
    expectTypeOf<Dialog.Root.Props<{ id: string }>>().toEqualTypeOf<DialogRootProps<{ id: string }>>();
    expectTypeOf<Dialog.Trigger.Props<{ id: string }>>().toEqualTypeOf<DialogTriggerProps<{ id: string }>>();
    expectTypeOf<Dialog.Root.Props>().toEqualTypeOf<DialogRootProps>();
  });
});
