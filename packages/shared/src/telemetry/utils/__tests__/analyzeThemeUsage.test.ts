import type { Appearance } from '@clerk/types';

import { analyzeThemeUsage } from '../analyzeThemeUsage';

describe('analyzeThemeUsage', () => {
  it('returns empty object for undefined appearance', () => {
    const result = analyzeThemeUsage(undefined);
    expect(result).toEqual({});
  });

  it('returns empty object for empty appearance object', () => {
    const result = analyzeThemeUsage({});
    expect(result).toEqual({});
  });

  it('returns empty object when no theme is provided', () => {
    const appearance: Appearance = {
      variables: { colorPrimary: '#ff0000' },
      elements: { button: 'custom-class' },
    };
    const result = analyzeThemeUsage(appearance);
    expect(result).toEqual({});
  });

  it('identifies shadcn theme correctly from explicit theme name', () => {
    const appearance: Appearance = {
      theme: {
        __type: 'prebuilt_appearance',
        __themeName: 'shadcn',
        variables: {
          colorBackground: 'var(--card)',
          colorPrimary: 'var(--primary)',
        },
        elements: {
          input: 'bg-transparent dark:bg-input/30',
        },
      } as any,
    };

    const result = analyzeThemeUsage(appearance);
    expect(result).toEqual({ themeName: 'shadcn' });
  });

  it('identifies shadcn theme correctly from baseTheme with explicit name', () => {
    const appearance: Appearance = {
      baseTheme: {
        __type: 'prebuilt_appearance',
        __themeName: 'shadcn',
        variables: {
          colorBackground: 'var(--card)',
          colorPrimary: 'var(--primary)',
        },
        elements: {
          input: 'bg-transparent dark:bg-input/30',
        },
      } as any,
    };

    const result = analyzeThemeUsage(appearance);
    expect(result).toEqual({ themeName: 'shadcn' });
  });

  it('prioritizes theme over baseTheme when both are present', () => {
    const appearance: Appearance = {
      theme: 'simple' as any,
      baseTheme: {
        __type: 'prebuilt_appearance',
        variables: {
          colorBackground: 'var(--card)',
          colorPrimary: 'var(--primary)',
        },
        elements: {
          input: 'bg-transparent dark:bg-input/30',
        },
      } as any,
    };

    const result = analyzeThemeUsage(appearance);
    expect(result).toEqual({ themeName: 'simple' });
  });

  it('handles string themes', () => {
    const appearance: Appearance = {
      theme: 'clerk' as any,
    };

    const result = analyzeThemeUsage(appearance);
    expect(result).toEqual({ themeName: 'clerk' });
  });

  it('finds first identifiable theme in array', () => {
    const appearance: Appearance = {
      theme: [
        { customProp: 'value' }, // Custom theme, no identifiable name
        {
          __type: 'prebuilt_appearance',
          __themeName: 'shadcn',
          variables: {
            colorBackground: 'var(--card)',
            colorPrimary: 'var(--primary)',
          },
          elements: {
            input: 'bg-transparent dark:bg-input/30',
          },
        },
      ] as any,
    };

    const result = analyzeThemeUsage(appearance);
    expect(result).toEqual({ themeName: 'shadcn' });
  });

  it('returns undefined theme name for unidentifiable themes', () => {
    const appearance: Appearance = {
      theme: {
        __type: 'prebuilt_appearance',
        variables: { colorPrimary: '#custom' },
        elements: { button: 'custom-style' },
      } as any,
    };

    const result = analyzeThemeUsage(appearance);
    expect(result).toEqual({ themeName: undefined });
  });

  it('returns undefined for themes without explicit names', () => {
    const appearance: Appearance = {
      theme: {
        __type: 'prebuilt_appearance',
        // No __themeName property - should return undefined
        variables: {
          colorBackground: 'var(--card)',
          colorPrimary: 'var(--primary)',
        },
        elements: {
          input: 'bg-transparent dark:bg-input/30',
        },
      } as any,
    };

    const result = analyzeThemeUsage(appearance);
    expect(result).toEqual({ themeName: undefined });
  });

  it('handles custom theme names', () => {
    const appearance: Appearance = {
      theme: {
        __type: 'prebuilt_appearance',
        __themeName: 'my-custom-theme',
        variables: { colorPrimary: '#purple' },
      } as any,
    };

    const result = analyzeThemeUsage(appearance);
    expect(result).toEqual({ themeName: 'my-custom-theme' });
  });
});
