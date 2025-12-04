import { describe, expect, it } from 'vitest';

import type { Appearance, BaseTheme } from '../../internal/appearance';
import { extractCssLayerNameFromAppearance } from '../extractCssLayerNameFromAppearance';

describe('extractCssLayerNameFromAppearance', () => {
  it('extracts cssLayerName from single theme and moves it to appearance level', () => {
    const appearance: Appearance = {
      theme: {
        __type: 'prebuilt_appearance' as const,
        cssLayerName: 'theme-layer',
      },
    };

    const result = extractCssLayerNameFromAppearance(appearance);

    expect(result?.cssLayerName).toBe('theme-layer');
    expect(result?.theme).toBeDefined();
    if (result?.theme && !Array.isArray(result.theme)) {
      expect((result.theme as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
      // @ts-expect-error __type is a hidden prop
      expect(result.theme.__type).toBe('prebuilt_appearance');
    }
  });

  it('preserves appearance-level cssLayerName over theme cssLayerName', () => {
    const appearance: Appearance = {
      cssLayerName: 'appearance-layer',
      theme: {
        __type: 'prebuilt_appearance' as const,
        cssLayerName: 'theme-layer',
      },
    };

    const result = extractCssLayerNameFromAppearance(appearance);

    expect(result?.cssLayerName).toBe('appearance-layer');
    if (result?.theme && !Array.isArray(result.theme)) {
      expect((result.theme as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
    }
  });

  it('extracts cssLayerName from first theme in array that has one', () => {
    const appearance: Appearance = {
      theme: [
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
    expect(result?.theme).toBeDefined();
    if (result?.theme && Array.isArray(result.theme)) {
      expect(result.theme).toHaveLength(3);
      expect((result.theme[0] as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
      expect((result.theme[1] as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
      expect((result.theme[2] as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
      result.theme.forEach(t => {
        expect(t.__type).toBe('prebuilt_appearance');
      });
    }
  });

  it('preserves appearance-level cssLayerName over array theme cssLayerName', () => {
    const appearance: Appearance = {
      cssLayerName: 'appearance-layer',
      theme: [
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
    if (result?.theme && Array.isArray(result.theme)) {
      result.theme.forEach(t => {
        expect((t as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
      });
    }
  });

  it('handles single theme without cssLayerName', () => {
    const appearance: Appearance = {
      theme: {
        __type: 'prebuilt_appearance' as const,
      },
    };

    const result = extractCssLayerNameFromAppearance(appearance);

    expect(result?.cssLayerName).toBeUndefined();
    if (result?.theme && !Array.isArray(result.theme)) {
      // @ts-expect-error __type is a hidden prop
      expect(result.theme.__type).toBe('prebuilt_appearance');
      expect((result.theme as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
    }
  });

  it('handles array of themes without any cssLayerName', () => {
    const appearance: Appearance = {
      theme: [
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
    if (result?.theme && Array.isArray(result.theme)) {
      expect(result.theme).toHaveLength(2);
      result.theme.forEach(t => {
        expect(t.__type).toBe('prebuilt_appearance');
        expect((t as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
      });
    }
  });

  it('handles no theme provided', () => {
    const appearance: Appearance = {
      cssLayerName: 'standalone-layer',
    };

    const result = extractCssLayerNameFromAppearance(appearance);

    expect(result?.cssLayerName).toBe('standalone-layer');
    expect(result?.theme).toBeUndefined();
  });

  it('handles undefined appearance', () => {
    const result = extractCssLayerNameFromAppearance(undefined);

    expect(result).toBeUndefined();
  });

  it('preserves other appearance properties', () => {
    const appearance: Appearance = {
      variables: { colorPrimary: 'blue' },
      theme: {
        __type: 'prebuilt_appearance' as const,
        cssLayerName: 'theme-layer',
      },
    };

    const result = extractCssLayerNameFromAppearance(appearance);

    expect(result?.cssLayerName).toBe('theme-layer');
    expect(result?.variables?.colorPrimary).toBe('blue');
    if (result?.theme && !Array.isArray(result.theme)) {
      expect((result.theme as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
    }
  });

  it('handles empty theme array', () => {
    const appearance: Appearance = {
      theme: [],
    };

    const result = extractCssLayerNameFromAppearance(appearance);

    expect(result?.cssLayerName).toBeUndefined();
    expect(result?.theme).toEqual([]);
    expect(Array.isArray(result?.theme)).toBe(true);
  });

  it('uses first valid cssLayerName from mixed array when appearance.cssLayerName is absent', () => {
    const appearance: Appearance = {
      theme: [
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
    expect(Array.isArray(result?.theme)).toBe(true);
    if (Array.isArray(result?.theme)) {
      expect(result.theme).toHaveLength(3);
      // Check that cssLayerName was removed from all themes
      result.theme.forEach(t => {
        expect((t as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
      });
    }
  });

  it('preserves appearance.cssLayerName over theme array cssLayerName', () => {
    const appearance: Appearance = {
      cssLayerName: 'appearance-level-layer',
      theme: [
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
    expect(Array.isArray(result?.theme)).toBe(true);
    if (Array.isArray(result?.theme)) {
      expect(result.theme).toHaveLength(2);
      // Check that cssLayerName was removed from all themes
      result.theme.forEach(t => {
        expect((t as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
      });
    }
  });

  it('returns single theme unchanged when it has no cssLayerName', () => {
    const appearance: Appearance = {
      theme: {
        __type: 'prebuilt_appearance' as const,
        // No cssLayerName property
      },
    };

    const result = extractCssLayerNameFromAppearance(appearance);

    expect(result?.cssLayerName).toBeUndefined();
    expect(result?.theme).toEqual({
      __type: 'prebuilt_appearance',
    });
    expect(Array.isArray(result?.theme)).toBe(false);
  });
});
