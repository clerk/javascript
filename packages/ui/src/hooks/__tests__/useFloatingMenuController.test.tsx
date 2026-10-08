import { describe, expect, it } from 'vitest';

import { act, renderHook } from '@/test/utils';

import { useFloatingMenuController } from '../useFloatingMenuController';

describe('Floating menu closure', () => {
  it('keeps a closed menu closed', () => {
    const { result } = renderHook(() => useFloatingMenuController({ placement: 'bottom-end' }));
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.triggerProps['aria-controls']).toBeUndefined();
  });

  it('closes an open menu once when multiple completion callbacks run', () => {
    const { result } = renderHook(() => useFloatingMenuController({ placement: 'bottom-end', defaultOpen: true }));
    expect(result.current.isOpen).toBe(true);
    const retainedClose = result.current.close;
    act(() => {
      retainedClose();
      retainedClose();
    });
    expect(result.current.isOpen).toBe(false);
    act(retainedClose);
    expect(result.current.isOpen).toBe(false);
  });
});
