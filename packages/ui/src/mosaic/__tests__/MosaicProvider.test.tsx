import { render, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import type { MosaicAppearance } from '../appearance';
import { parseMosaicAppearance, useMosaicAppearance } from '../appearance';
import { MosaicProvider, useMosaicTheme } from '../MosaicProvider';

const appearance: MosaicAppearance = {
  elements: {
    button: { color: 'green' },
    signIn: { button: { color: 'red' } },
  },
};

// Every MosaicProvider render now self-creates the Emotion insertion-point node and Emotion
// appends its own <style data-emotion> tags, so clear both after each test to keep the document
// fresh across the whole file (Emotion tags would otherwise leak across the layer-wrapping cases).
afterEach(() => {
  document
    .querySelectorAll('style#cl-mosaic-style-insertion-point, style[data-emotion]')
    .forEach(node => node.remove());
});

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

describe('MosaicProvider global reset', () => {
  const styleText = () =>
    Array.from(document.querySelectorAll('style'))
      .map(node => node.textContent ?? '')
      .join('');

  it('emits a zero-specificity box-sizing/margin/padding reset scoped to [data-cl-slot]', () => {
    render(React.createElement(MosaicProvider, {}, React.createElement('div')));

    const css = styleText();
    // `:where()` keeps the reset at 0 specificity so component classes always win on insertion-order ties.
    expect(css).toContain(':where([data-cl-slot])');
    expect(css).toContain('box-sizing:border-box');
    expect(css).toContain('margin:0');
    expect(css).toContain('padding:0');
  });
});

describe('MosaicProvider cssLayerName', () => {
  // Emotion's generated component styles carry `data-emotion`; the static reset does not, so this
  // isolates the styles inserted *through the cache* — the ones the layer wrap has to cover.
  const emotionCss = () =>
    Array.from(document.querySelectorAll('style[data-emotion]'))
      .map(node => node.textContent ?? '')
      .join('');

  it('wraps cache-generated component styles in the layer when cssLayerName is set', () => {
    render(
      <MosaicProvider cssLayerName='cl-test'>
        <div css={{ color: 'red' }} />
      </MosaicProvider>,
    );

    const css = emotionCss();
    expect(css).toContain('color:red');
    // Without the insert wrap, the generated rule ships unlayered and outranks a consumer's
    // @layer-ed app styles. The @layer only appears in Emotion output when the wrap is applied.
    expect(css).toContain('@layer cl-test');
  });

  it('leaves cache-generated styles unlayered when no cssLayerName is set', () => {
    render(
      <MosaicProvider>
        <div css={{ color: 'blue' }} />
      </MosaicProvider>,
    );

    const css = emotionCss();
    expect(css).toContain('color:blue');
    expect(css).not.toContain('@layer');
  });
});

describe('MosaicProvider Emotion insertion point', () => {
  it('creates the insertion-point node when the host has not supplied one', () => {
    expect(document.querySelector('style#cl-mosaic-style-insertion-point')).toBeNull();

    render(React.createElement(MosaicProvider, {}, React.createElement('div')));

    expect(document.querySelectorAll('style#cl-mosaic-style-insertion-point')).toHaveLength(1);
  });

  it('reuses a host-supplied node instead of creating a second one', () => {
    const existing = document.createElement('style');
    existing.id = 'cl-mosaic-style-insertion-point';
    document.head.appendChild(existing);

    render(React.createElement(MosaicProvider, {}, React.createElement('div')));

    const nodes = document.querySelectorAll('style#cl-mosaic-style-insertion-point');
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toBe(existing);
  });
});
