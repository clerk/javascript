import { describe, expect, it } from 'vitest';

import type { Appearance, BaseTheme } from '../../internal/appearance';
import { extractCssLayerNameFromAppearance } from '../extractCssLayerNameFromAppearance';

describe('extractCssLayerNameFromAppearance', () => {
  it('extracts cssLayerName from single baseTheme and moves it to appearance level', () => {
    const appearance: Appearance = {
      baseTheme: {
        __type: 'prebuilt_appearance' as const,
        cssLayerName: 'theme-layer',
      },
    };

    const result = extractCssLayerNameFromAppearance(appearance);

    expect(result?.cssLayerName).toBe('theme-layer');
    expect(result?.baseTheme).toBeDefined();
    if (result?.baseTheme && !Array.isArray(result.baseTheme)) {
      expect((result.baseTheme as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
      // @ts-expect-error __type is a hidden prop
      expect(result.baseTheme.__type).toBe('prebuilt_appearance');
    }
  });

  it('preserves appearance-level cssLayerName over baseTheme cssLayerName', () => {
    const appearance: Appearance = {
      cssLayerName: 'appearance-layer',
      baseTheme: {
        __type: 'prebuilt_appearance' as const,
        cssLayerName: 'theme-layer',
      },
    };

    const result = extractCssLayerNameFromAppearance(appearance);

    expect(result?.cssLayerName).toBe('appearance-layer');
    if (result?.baseTheme && !Array.isArray(result.baseTheme)) {
      expect((result.baseTheme as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
    }
  });

  it('extracts cssLayerName from first theme in array that has one', () => {
    const appearance: Appearance = {
      baseTheme: [
        {
          __type: 'prebuilt_appearance' as const,
        },
        {
          __type: 'prebuilt_appearance' as const,
          cssLayerName: 'first-layer',
        },
        {
          __type: 'prebuilt_appearance' as const,
          cssLayerName: 'second-layer',
        },
      ],
    };

    const result = extractCssLayerNameFromAppearance(appearance);

    expect(result?.cssLayerName).toBe('first-layer');
    expect(result?.baseTheme).toBeDefined();
    if (result?.baseTheme && Array.isArray(result.baseTheme)) {
      expect(result.baseTheme).toHaveLength(3);
      expect((result.baseTheme[0] as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
      expect((result.baseTheme[1] as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
      expect((result.baseTheme[2] as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
      result.baseTheme.forEach(theme => {
        expect(theme.__type).toBe('prebuilt_appearance');
      });
    }
  });

  it('preserves appearance-level cssLayerName over array baseTheme cssLayerName', () => {
    const appearance: Appearance = {
      cssLayerName: 'appearance-layer',
      baseTheme: [
        {
          __type: 'prebuilt_appearance' as const,
          cssLayerName: 'theme1-layer',
        },
        {
          __type: 'prebuilt_appearance' as const,
          cssLayerName: 'theme2-layer',
        },
      ],
    };

    const result = extractCssLayerNameFromAppearance(appearance);

    expect(result?.cssLayerName).toBe('appearance-layer');
    if (result?.baseTheme && Array.isArray(result.baseTheme)) {
      result.baseTheme.forEach(theme => {
        expect((theme as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
      });
    }
  });

  it('handles single baseTheme without cssLayerName', () => {
    const appearance: Appearance = {
      baseTheme: {
        __type: 'prebuilt_appearance' as const,
      },
    };

    const result = extractCssLayerNameFromAppearance(appearance);

    expect(result?.cssLayerName).toBeUndefined();
    if (result?.baseTheme && !Array.isArray(result.baseTheme)) {
      // @ts-expect-error __type is a hidden prop
      expect(result.baseTheme.__type).toBe('prebuilt_appearance');
      expect((result.baseTheme as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
    }
  });

  it('handles array of baseThemes without any cssLayerName', () => {
    const appearance: Appearance = {
      baseTheme: [
        {
          __type: 'prebuilt_appearance' as const,
        },
        {
          __type: 'prebuilt_appearance' as const,
        },
      ],
    };

    const result = extractCssLayerNameFromAppearance(appearance);

    expect(result?.cssLayerName).toBeUndefined();
    if (result?.baseTheme && Array.isArray(result.baseTheme)) {
      expect(result.baseTheme).toHaveLength(2);
      result.baseTheme.forEach(theme => {
        expect(theme.__type).toBe('prebuilt_appearance');
        expect((theme as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
      });
    }
  });

  it('handles no baseTheme provided', () => {
    const appearance: Appearance = {
      cssLayerName: 'standalone-layer',
    };

    const result = extractCssLayerNameFromAppearance(appearance);

    expect(result?.cssLayerName).toBe('standalone-layer');
    expect(result?.baseTheme).toBeUndefined();
  });

  it('handles undefined appearance', () => {
    const result = extractCssLayerNameFromAppearance(undefined);

    expect(result).toBeUndefined();
  });

  it('preserves other appearance properties', () => {
    const appearance: Appearance = {
      variables: { colorPrimary: 'blue' },
      baseTheme: {
        __type: 'prebuilt_appearance' as const,
        cssLayerName: 'theme-layer',
      },
    };

    const result = extractCssLayerNameFromAppearance(appearance);

    expect(result?.cssLayerName).toBe('theme-layer');
    expect(result?.variables?.colorPrimary).toBe('blue');
    if (result?.baseTheme && !Array.isArray(result.baseTheme)) {
      expect((result.baseTheme as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
    }
  });

  it('handles empty baseTheme array', () => {
    const appearance: Appearance = {
      baseTheme: [],
    };

    const result = extractCssLayerNameFromAppearance(appearance);

    expect(result?.cssLayerName).toBeUndefined();
    expect(result?.baseTheme).toEqual([]);
    expect(Array.isArray(result?.baseTheme)).toBe(true);
  });

  it('uses first valid cssLayerName from mixed array when appearance.cssLayerName is absent', () => {
    const appearance: Appearance = {
      baseTheme: [
        {
          __type: 'prebuilt_appearance' as const,
          // No cssLayerName in first theme
        },
        {
          __type: 'prebuilt_appearance' as const,
          cssLayerName: 'second-theme-layer',
        },
        {
          __type: 'prebuilt_appearance' as const,
          cssLayerName: 'third-theme-layer',
        },
      ],
    };

    const result = extractCssLayerNameFromAppearance(appearance);

    expect(result?.cssLayerName).toBe('second-theme-layer');
    expect(Array.isArray(result?.baseTheme)).toBe(true);
    if (Array.isArray(result?.baseTheme)) {
      expect(result.baseTheme).toHaveLength(3);
      // Check that cssLayerName was removed from all themes
      result.baseTheme.forEach(theme => {
        expect((theme as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
      });
    }
  });

  it('preserves appearance.cssLayerName over baseTheme array cssLayerName', () => {
    const appearance: Appearance = {
      cssLayerName: 'appearance-level-layer',
      baseTheme: [
        {
          __type: 'prebuilt_appearance' as const,
          cssLayerName: 'theme-layer-1',
        },
        {
          __type: 'prebuilt_appearance' as const,
          cssLayerName: 'theme-layer-2',
        },
      ],
    };

    const result = extractCssLayerNameFromAppearance(appearance);

    expect(result?.cssLayerName).toBe('appearance-level-layer');
    expect(Array.isArray(result?.baseTheme)).toBe(true);
    if (Array.isArray(result?.baseTheme)) {
      expect(result.baseTheme).toHaveLength(2);
      // Check that cssLayerName was removed from all themes
      result.baseTheme.forEach(theme => {
        expect((theme as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
      });
    }
  });

  it('returns single theme unchanged when it has no cssLayerName', () => {
    const appearance: Appearance = {
      baseTheme: {
        __type: 'prebuilt_appearance' as const,
        // No cssLayerName property
      },
    };

    const result = extractCssLayerNameFromAppearance(appearance);

    expect(result?.cssLayerName).toBeUndefined();
    expect(result?.baseTheme).toEqual({
      __type: 'prebuilt_appearance',
    });
    expect(Array.isArray(result?.baseTheme)).toBe(false);
  });
});
