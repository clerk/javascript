import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { DirectionProvider, useDirection } from './index';

describe('DirectionProvider', () => {
  it('defaults to ltr without a provider', () => {
    const { result } = renderHook(() => useDirection());
    expect(result.current).toBe('ltr');
  });

  it('defaults to ltr when no direction is given', () => {
    const { result } = renderHook(() => useDirection(), {
      wrapper: ({ children }) => <DirectionProvider>{children}</DirectionProvider>,
    });
    expect(result.current).toBe('ltr');
  });

  it('provides the direction to descendants', () => {
    const { result } = renderHook(() => useDirection(), {
      wrapper: ({ children }) => <DirectionProvider direction='rtl'>{children}</DirectionProvider>,
    });
    expect(result.current).toBe('rtl');
  });

  it('lets a nested provider override an outer one', () => {
    const { result } = renderHook(() => useDirection(), {
      wrapper: ({ children }) => (
        <DirectionProvider direction='rtl'>
          <DirectionProvider direction='ltr'>{children}</DirectionProvider>
        </DirectionProvider>
      ),
    });
    expect(result.current).toBe('ltr');
  });
});
