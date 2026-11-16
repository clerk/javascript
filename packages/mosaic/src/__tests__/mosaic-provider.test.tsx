import { render, renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import type { MosaicIconOverrides } from '../icons/overrides';
import { useMosaicIcons } from '../icons/overrides';
import { useLocale, useMessages } from '../localization';
import { MosaicProvider } from '../mosaic-provider';
import { useDirection } from '../primitives/direction-provider';
import { installWebmcp } from './feature/webmcp';

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

describe('MosaicProvider direction', () => {
  it('passes the direction prop to useDirection', () => {
    const { result } = renderHook(() => useDirection(), {
      wrapper: ({ children }) => React.createElement(MosaicProvider, { direction: 'rtl' }, children),
    });
    expect(result.current).toBe('rtl');
  });

  it('defaults to ltr', () => {
    const { result } = renderHook(() => useDirection(), {
      wrapper: ({ children }) => React.createElement(MosaicProvider, {}, children),
    });
    expect(result.current).toBe('ltr');
  });
});

describe('MosaicProvider webmcp', () => {
  it('hands the browser the agent tools until it unmounts', () => {
    const webmcp = installWebmcp();
    const { unmount } = render(React.createElement(MosaicProvider, { experimental: { webmcp: true } }, null));

    expect(webmcp.names()).toEqual(['clerk_snapshot', 'clerk_act']);
    expect(webmcp.call('clerk_snapshot')).toEqual([]);

    unmount();

    expect(webmcp.names()).toEqual([]);
  });

  it('hands the browser nothing without webmcp', () => {
    const webmcp = installWebmcp();
    render(React.createElement(MosaicProvider, {}, null));

    expect(webmcp.names()).toEqual([]);
  });
});
