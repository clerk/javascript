import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import type { MosaicIconOverrides } from '../icons/overrides';
import { useMosaicIcons } from '../icons/overrides';
import { useLocale, useMessages } from '../localization';
import { MosaicProvider } from '../MosaicProvider';

describe('MosaicProvider icons', () => {
  it('exposes the icon overrides via useMosaicIcons', () => {
    const icons: MosaicIconOverrides = { checkmark: React.createElement('svg') };
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

describe('MosaicProvider localization', () => {
  it('overlays the localization prop onto the built-in messages', () => {
    const { result } = renderHook(() => useMessages('userButton'), {
      wrapper: ({ children }) =>
        React.createElement(
          MosaicProvider,
          { localization: { messages: { 'userButton.popup.label': 'Konto' } } },
          children,
        ),
    });
    expect(result.current.popup.label).toBe('Konto');
  });

  it('exposes the locale via useLocale', () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: ({ children }) => React.createElement(MosaicProvider, { localization: { locale: 'de' } }, children),
    });
    expect(result.current).toBe('de');
  });
});
