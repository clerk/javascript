import React from 'react';
import { renderHook } from '@clerk/shared/testUtils';
import { useDetectClickOutside } from './useDetectClickOutside';

describe('useDetectClickOutside(el, defaultActive)', () => {
  it('returns {active, setIsActive}', () => {
    const ref = React.createRef<HTMLElement>();
    const { result } = renderHook(() => useDetectClickOutside(ref, false));

    expect(result.current.isActive).toBe(false);
    expect(result.current.setIsActive).toBeInstanceOf(Function);
  });
});
