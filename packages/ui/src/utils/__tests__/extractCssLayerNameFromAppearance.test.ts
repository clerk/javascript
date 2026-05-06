import { describe, expect, it } from 'vitest';

import { extractCssLayerNameFromAppearance } from '../extractCssLayerNameFromAppearance';

describe('extractCssLayerNameFromAppearance', () => {
  it('promotes cssLayerName from a single theme to the appearance level', () => {
    const theme = {
      name: 'shadcn',
      cssLayerName: 'components',
      variables: {},
      elements: {},
      __type: 'prebuilt_appearance' as const,
    };

    const result = extractCssLayerNameFromAppearance({ theme });

    expect(result?.cssLayerName).toBe('components');
  });

  it('promotes cssLayerName from a theme array to the appearance level', () => {
    const theme = {
      name: 'shadcn',
      cssLayerName: 'components',
      variables: {},
      elements: {},
      __type: 'prebuilt_appearance' as const,
    };

    const result = extractCssLayerNameFromAppearance({ theme: [theme] });

    expect(result?.cssLayerName).toBe('components');
  });

  it('preserves explicit cssLayerName on appearance over theme cssLayerName', () => {
    const theme = {
      name: 'shadcn',
      cssLayerName: 'components',
      variables: {},
      elements: {},
      __type: 'prebuilt_appearance' as const,
    };

    const result = extractCssLayerNameFromAppearance({ theme, cssLayerName: 'custom' });

    expect(result?.cssLayerName).toBe('custom');
  });

  it('returns appearance unchanged when no theme is present', () => {
    const appearance = { cssLayerName: 'custom' };
    const result = extractCssLayerNameFromAppearance(appearance);

    expect(result).toEqual(appearance);
  });

  it('returns undefined for undefined input', () => {
    expect(extractCssLayerNameFromAppearance(undefined)).toBeUndefined();
  });

  describe('Components.updateProps state merge', () => {
    // This replicates the state merge in Components.tsx updateProps handler:
    //   setState(s => ({ ...s, ...restProps, options: { ...s.options, ...restProps.options } }))
    //
    // When ClerkProvider re-renders, it calls __internal_updateProps({ appearance: { theme: shadcn } }).
    // This arrives in updateProps as restProps = { appearance: { theme: shadcn } }.
    // The bug: cssLayerName buried in theme is not promoted to appearance level,
    // so StyleCacheProvider never wraps Clerk CSS in @layer.

    function updatePropsStateMerge(currentState: Record<string, any>, restProps: Record<string, any>) {
      // This is the exact logic from Components.tsx line 400 (without fix)
      return { ...currentState, ...restProps, options: { ...currentState.options, ...restProps.options } };
    }

    function updatePropsStateMergeFixed(currentState: Record<string, any>, restProps: Record<string, any>) {
      if (restProps.appearance) {
        restProps = { ...restProps, appearance: extractCssLayerNameFromAppearance(restProps.appearance) };
      }
      return { ...currentState, ...restProps, options: { ...currentState.options, ...restProps.options } };
    }

    const theme = {
      name: 'shadcn',
      cssLayerName: 'components',
      variables: {},
      elements: {},
      __type: 'prebuilt_appearance' as const,
    };

    const initialState = {
      appearance: { theme, cssLayerName: 'components' }, // after mountComponentRenderer extraction
      options: {},
    };

    it('BUG: updateProps overwrites extracted cssLayerName with raw appearance from ClerkProvider', () => {
      // ClerkProvider sends raw appearance (cssLayerName only inside theme, not at top level)
      const restProps = { appearance: { theme } };
      const newState = updatePropsStateMerge(initialState, restProps);

      // cssLayerName is lost — it's only inside theme, not at the appearance level
      expect(newState.appearance.cssLayerName).toBeUndefined();
    });

    it('FIX: updateProps extracts cssLayerName from theme before merging into state', () => {
      const restProps = { appearance: { theme } };
      const newState = updatePropsStateMergeFixed(initialState, restProps);

      expect(newState.appearance.cssLayerName).toBe('components');
    });
  });
});
