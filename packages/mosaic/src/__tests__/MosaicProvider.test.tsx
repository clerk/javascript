import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import type { MosaicIconOverrides } from '../icons/overrides';
import { useMosaicIcons } from '../icons/overrides';
import { MosaicProvider } from '../MosaicProvider';

describe('MosaicProvider icons', () => {
  it('exposes the icon overrides via useMosaicIcons', () => {
    const icons: MosaicIconOverrides = { check: React.createElement('svg') };
    const { result } = renderHook(() => useMosaicIcons(), {
      wrapper: ({ children }) => React.createElement(MosaicProvider, { icons }, children),
    });
    expect(result.current).toBe(icons);
  });

  it('defaults to {} when no icons are supplied', () => {
    const { result } = renderHook(() => useMosaicIcons(), {
      wrapper: ({ children }) => React.createElement(MosaicProvider, {}, children),
    });
    expect(result.current).toEqual({});
  });

  it('defaults to {} when standalone', () => {
    const { result } = renderHook(() => useMosaicIcons());
    expect(result.current).toEqual({});
  });
});
