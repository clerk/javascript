import type { Appearance, BaseTheme } from '@clerk/types';
import { describe, expect, it } from 'vitest';

import { processCssLayerNameExtraction } from '../appearance';

describe('processCssLayerNameExtraction', () => {
  it('extracts cssLayerName from single baseTheme and moves it to appearance level', () => {
    const appearance: Appearance = {
      baseTheme: {
        __type: 'prebuilt_appearance' as const,
        cssLayerName: 'theme-layer',
      },
    };

    const result = processCssLayerNameExtraction(appearance);

    expect(result?.cssLayerName).toBe('theme-layer');
    expect(result?.baseTheme).toBeDefined();
    if (result?.baseTheme && !Array.isArray(result.baseTheme)) {
      expect((result.baseTheme as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
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

    const result = processCssLayerNameExtraction(appearance);

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

    const result = processCssLayerNameExtraction(appearance);

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

    const result = processCssLayerNameExtraction(appearance);

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

    const result = processCssLayerNameExtraction(appearance);

    expect(result?.cssLayerName).toBeUndefined();
    if (result?.baseTheme && !Array.isArray(result.baseTheme)) {
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

    const result = processCssLayerNameExtraction(appearance);

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

    const result = processCssLayerNameExtraction(appearance);

    expect(result?.cssLayerName).toBe('standalone-layer');
    expect(result?.baseTheme).toBeUndefined();
  });

  it('handles undefined appearance', () => {
    const result = processCssLayerNameExtraction(undefined);

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

    const result = processCssLayerNameExtraction(appearance);

    expect(result?.cssLayerName).toBe('theme-layer');
    expect(result?.variables?.colorPrimary).toBe('blue');
    if (result?.baseTheme && !Array.isArray(result.baseTheme)) {
      expect((result.baseTheme as BaseTheme & { cssLayerName?: string }).cssLayerName).toBeUndefined();
    }
  });
});
