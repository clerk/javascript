import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import type { MosaicAppearance } from '../appearance';
import { parseMosaicAppearance, useMosaicAppearance } from '../appearance';
import { MosaicProvider, useMosaicTheme } from '../MosaicProvider';

const appearance: MosaicAppearance = {
  elements: {
    button: { color: 'green' },
    signIn: { button: { color: 'red' } },
  },
};

describe('parseMosaicAppearance', () => {
  it('returns [] with no appearance', () => {
    expect(parseMosaicAppearance(undefined, 'signIn')).toEqual([]);
  });

  it('returns only the global layer (scope keys stripped) with no scope', () => {
    expect(parseMosaicAppearance(appearance)).toEqual([{ button: { color: 'green' } }]);
  });

  it('returns [global, scoped] in order for a matching scope', () => {
    expect(parseMosaicAppearance(appearance, 'signIn')).toEqual([
      { button: { color: 'green' } },
      { button: { color: 'red' } },
    ]);
  });

  it('omits an unmatched scope layer', () => {
    expect(parseMosaicAppearance(appearance, 'signUp')).toEqual([{ button: { color: 'green' } }]);
  });

  it('emits only the scoped layer when there are no global slot overrides', () => {
    const scopedOnly: MosaicAppearance = { elements: { signIn: { button: { color: 'red' } } } };
    expect(parseMosaicAppearance(scopedOnly, 'signIn')).toEqual([{ button: { color: 'red' } }]);
  });
});

describe('MosaicProvider appearance context', () => {
  it('exposes [global, scoped] layers via useMosaicAppearance', () => {
    const { result } = renderHook(() => useMosaicAppearance(), {
      wrapper: ({ children }) => React.createElement(MosaicProvider, { appearance, scope: 'signIn' }, children),
    });
    expect(result.current).toEqual([{ button: { color: 'green' } }, { button: { color: 'red' } }]);
  });

  it('defaults to [] when standalone (no appearance)', () => {
    const { result } = renderHook(() => useMosaicAppearance());
    expect(result.current).toEqual([]);
  });
});

describe('MosaicProvider theme from appearance.variables', () => {
  it('resolves the theme from variables nested in appearance (global only)', () => {
    const withVars: MosaicAppearance = { variables: { rounded: { md: '1rem' } } };
    const { result } = renderHook(() => useMosaicTheme(), {
      wrapper: ({ children }) => React.createElement(MosaicProvider, { appearance: withVars }, children),
    });
    expect(result.current.rounded.md).toBe('1rem');
  });

  it('falls back to default tokens when no variables are supplied', () => {
    const { result } = renderHook(() => useMosaicTheme(), {
      wrapper: ({ children }) => React.createElement(MosaicProvider, {}, children),
    });
    expect(result.current.rounded.md).toBe('0.375rem');
  });
});
