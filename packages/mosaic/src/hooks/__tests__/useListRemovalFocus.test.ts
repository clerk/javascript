import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useListRemovalFocus } from '../useListRemovalFocus';

describe('list removal focus', () => {
  it('leaves focus restoration to the dialog when removal is cancelled', async () => {
    const fallback = document.createElement('button');
    const { result } = renderHook(() =>
      useListRemovalFocus({
        ids: ['device'],
        onRemove: () => Promise.resolve(false),
        fallback: () => fallback,
      }),
    );

    await result.current.remove('device');

    expect(result.current.finalFocus()).toBeNull();
  });
});
