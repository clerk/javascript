import type { ShowWhenCondition } from '@clerk/shared/types';
import { test } from 'vitest';

test('ShowWhenCondition rejects empty authorization objects', () => {
  // @ts-expect-error - empty object must not satisfy ShowWhenCondition/ProtectParams
  const when: ShowWhenCondition = {};
  void when;
});
