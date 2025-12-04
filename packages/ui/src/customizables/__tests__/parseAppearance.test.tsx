import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { render } from '@/test/utils';

import { Box, useAppearance } from '..';
import { AppearanceProvider } from '../AppearanceContext';
import { knownColors } from './test-utils';

const themeAColor = 'blue';
const themeA = {
  variables: {
    colorPrimary: themeAColor,
    colorDanger: themeAColor,
    colorSuccess: themeAColor,
    colorWarning: themeAColor,
    colorBackground: themeAColor,
    colorInput: themeAColor,
    colorInputForeground: themeAColor,
    colorText: themeAColor,
    colorPrimaryForeground: themeAColor,
    colorTextSecondary: themeAColor,
    borderRadius: '1rem',
    fontFamily: 'Comic Sans',
    fontFamilyButtons: 'Comic Sans',
    fontSize: '1rem',
    fontWeight: { normal: 600 },
    spacing: '1px',
  },
} as const;

const themeBColor = 'red';
const themeB = {
  variables: {
    colorPrimary: themeBColor,
    colorDanger: themeBColor,
    colorSuccess: themeBColor,
    colorWarning: themeBColor,
    colorBackground: themeBColor,
    colorInput: themeBColor,
    colorInputForeground: themeBColor,
    colorText: themeBColor,
    colorPrimaryForeground: themeBColor,
    colorTextSecondary: themeBColor,
    borderRadius: '2rem',
    fontFamily: 'Arial',
    fontFamilyButtons: 'Arial',
    fontSize: '2rem',
    fontWeight: { normal: 700 },
    spacing: '2px',
  },
} as const;

describe('AppearanceProvider', () => {
  it('renders the provider', () => {
    render(
      <AppearanceProvider appearanceKey='signIn'>
        <Box />
      </AppearanceProvider>,
    );
  });
});

describe('AppearanceProvider internalTheme flows', () => {
  it('sets the theme correctly from the globalAppearance prop', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        globalAppearance={themeA}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });

    expect(result.current.parsedInternalTheme.colors.$primary500).toBe(knownColors[themeAColor]);
    expect(result.current.parsedInternalTheme.colors.$danger500).toBe(knownColors[themeAColor]);
    expect(result.current.parsedInternalTheme.colors.$success500).toBe(knownColors[themeAColor]);
    expect(result.current.parsedInternalTheme.colors.$warning500).toBe(knownColors[themeAColor]);
    expect(result.current.parsedInternalTheme.colors.$colorBackground).toBe(knownColors[themeAColor]);
    expect(result.current.parsedInternalTheme.colors.$colorInput).toBe(knownColors[themeAColor]);
    expect(result.current.parsedInternalTheme.colors.$colorInputForeground).toBe(knownColors[themeAColor]);
    expect(result.current.parsedInternalTheme.colors.$colorForeground).toBe(knownColors[themeAColor]);
    expect(result.current.parsedInternalTheme.colors.$colorPrimaryForeground).toBe(knownColors[themeAColor]);
    expect(result.current.parsedInternalTheme.colors.$colorMutedForeground).toBe(knownColors[themeAColor]);
    expect(result.current.parsedInternalTheme.radii.$md).toBe(themeA.variables.borderRadius);
    expect(result.current.parsedInternalTheme.fonts.$main).toBe(themeA.variables.fontFamily);
    expect(result.current.parsedInternalTheme.fonts.$buttons).toBe(themeA.variables.fontFamily);
    expect(result.current.parsedInternalTheme.fontSizes.$md).toBe('1rem');
    expect(result.current.parsedInternalTheme.fontWeights.$normal).toBe(themeA.variables.fontWeight.normal);
    expect(result.current.parsedInternalTheme.space.$1).toContain(themeA.variables.spacing);
  });

  it('sets the theme correctly from the appearance prop', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        appearance={themeB}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });

    expect(result.current.parsedInternalTheme.colors.$primary500).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$danger500).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$success500).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$warning500).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$colorBackground).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$colorInput).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$colorInputForeground).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$colorForeground).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$colorPrimaryForeground).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$colorMutedForeground).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.radii.$md).toBe(themeB.variables.borderRadius);
    expect(result.current.parsedInternalTheme.fonts.$main).toBe(themeB.variables.fontFamily);
    expect(result.current.parsedInternalTheme.fonts.$buttons).toBe(themeB.variables.fontFamily);
    expect(result.current.parsedInternalTheme.fontSizes.$md).toBe('2rem');
    expect(result.current.parsedInternalTheme.fontWeights.$normal).toBe(themeB.variables.fontWeight.normal);
    expect(result.current.parsedInternalTheme.space.$1).toContain(themeB.variables.spacing);
  });

  it('merges the globalAppearance with the appearance in the theme', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        globalAppearance={themeA}
        appearance={themeB}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });

    expect(result.current.parsedInternalTheme.colors.$primary500).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$danger500).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$success500).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$warning500).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$colorBackground).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$colorInput).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$colorInputForeground).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$colorForeground).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$colorPrimaryForeground).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$colorMutedForeground).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.radii.$md).toBe(themeB.variables.borderRadius);
    expect(result.current.parsedInternalTheme.fonts.$main).toBe(themeB.variables.fontFamily);
    expect(result.current.parsedInternalTheme.fonts.$buttons).toBe(themeB.variables.fontFamily);
    expect(result.current.parsedInternalTheme.fontSizes.$md).toBe('2rem');
    expect(result.current.parsedInternalTheme.fontWeights.$normal).toBe(themeB.variables.fontWeight.normal);
    expect(result.current.parsedInternalTheme.space.$1).toContain(themeB.variables.spacing);
  });
});

describe('AppearanceProvider element flows', () => {
  it('sets the parsedElements correctly from the globalAppearance prop', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        globalAppearance={{
          elements: {
            alert: { backgroundColor: themeAColor },
          },
        }}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });
    //polished theme is index 0
    expect(result.current.parsedElements[1]['alert'].backgroundColor).toBe(themeAColor);
  });

  it('sets the parsedElements correctly from the globalAppearance and appearance prop', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        globalAppearance={{
          elements: {
            alert: { backgroundColor: themeAColor },
          },
        }}
        appearance={{
          elements: {
            alert: { backgroundColor: themeBColor },
          },
        }}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });
    //polished theme is index 0
    expect(result.current.parsedElements[1]['alert'].backgroundColor).toBe(themeAColor);
    expect(result.current.parsedElements[2]['alert'].backgroundColor).toBe(themeBColor);
  });

  it('sets the parsedElements correctly when a function is passed for the elements', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        globalAppearance={{
          variables: {
            colorPrimary: themeAColor,
          },
          elements: ({ theme }) => ({
            alert: { backgroundColor: theme.colors.$primary500 },
          }),
        }}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });
    //polished theme is index 0
    expect(result.current.parsedElements[1]['alert'].backgroundColor).toBe(knownColors[themeAColor]);
  });
});

describe('AppearanceProvider options flows', () => {
  it('sets the parsedOptions correctly from the globalAppearance prop', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        globalAppearance={{
          options: {
            helpPageUrl: 'https://example.com/help',
            logoImageUrl: 'https://placehold.co/64x64.png',
            logoLinkUrl: 'https://example.com/',
            privacyPageUrl: 'https://example.com/privacy',
            termsPageUrl: 'https://example.com/terms',
            logoPlacement: 'inside',
            showOptionalFields: false,
            socialButtonsPlacement: 'bottom',
            socialButtonsVariant: 'iconButton',
          },
        }}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });
    expect(result.current.parsedOptions.helpPageUrl).toBe('https://example.com/help');
    expect(result.current.parsedOptions.logoImageUrl).toBe('https://placehold.co/64x64.png');
    expect(result.current.parsedOptions.logoLinkUrl).toBe('https://example.com/');
    expect(result.current.parsedOptions.privacyPageUrl).toBe('https://example.com/privacy');
    expect(result.current.parsedOptions.termsPageUrl).toBe('https://example.com/terms');
    expect(result.current.parsedOptions.logoPlacement).toBe('inside');
    expect(result.current.parsedOptions.showOptionalFields).toBe(false);
    expect(result.current.parsedOptions.socialButtonsPlacement).toBe('bottom');
    expect(result.current.parsedOptions.socialButtonsVariant).toBe('iconButton');
  });

  it('sets the parsedOptions correctly from the appearance prop', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        appearance={{
          options: {
            helpPageUrl: 'https://example.com/help',
            logoImageUrl: 'https://placehold.co/64x64.png',
            logoLinkUrl: 'https://example.com/',
            privacyPageUrl: 'https://example.com/privacy',
            termsPageUrl: 'https://example.com/terms',
            logoPlacement: 'outside',
            showOptionalFields: true,
            socialButtonsPlacement: 'top',
            socialButtonsVariant: 'blockButton',
          },
        }}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });
    expect(result.current.parsedOptions.helpPageUrl).toBe('https://example.com/help');
    expect(result.current.parsedOptions.logoImageUrl).toBe('https://placehold.co/64x64.png');
    expect(result.current.parsedOptions.logoLinkUrl).toBe('https://example.com/');
    expect(result.current.parsedOptions.privacyPageUrl).toBe('https://example.com/privacy');
    expect(result.current.parsedOptions.termsPageUrl).toBe('https://example.com/terms');
    expect(result.current.parsedOptions.logoPlacement).toBe('outside');
    expect(result.current.parsedOptions.showOptionalFields).toBe(true);
    expect(result.current.parsedOptions.socialButtonsPlacement).toBe('top');
    expect(result.current.parsedOptions.socialButtonsVariant).toBe('blockButton');
  });

  it('sets the parsedOptions correctly from the globalAppearance and appearance prop', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        globalAppearance={{
          options: {
            helpPageUrl: 'https://example.com/help',
            logoImageUrl: 'https://placehold.co/64x64.png',
            logoLinkUrl: 'https://example.com/',
            privacyPageUrl: 'https://example.com/privacy',
            termsPageUrl: 'https://example.com/terms',
            logoPlacement: 'inside',
            showOptionalFields: false,
            socialButtonsPlacement: 'bottom',
            socialButtonsVariant: 'iconButton',
          },
        }}
        appearance={{
          options: {
            helpPageUrl: 'https://second.example.com/help',
            logoImageUrl: 'https://placehold.co/32x32@2.png',
            logoLinkUrl: 'https://second.example.com/',
            privacyPageUrl: 'https://second.example.com/privacy',
            termsPageUrl: 'https://second.example.com/terms',
            logoPlacement: 'outside',
            showOptionalFields: true,
            socialButtonsPlacement: 'top',
            socialButtonsVariant: 'blockButton',
          },
        }}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });
    expect(result.current.parsedOptions.helpPageUrl).toBe('https://second.example.com/help');
    expect(result.current.parsedOptions.logoImageUrl).toBe('https://placehold.co/32x32@2.png');
    expect(result.current.parsedOptions.logoLinkUrl).toBe('https://second.example.com/');
    expect(result.current.parsedOptions.privacyPageUrl).toBe('https://second.example.com/privacy');
    expect(result.current.parsedOptions.termsPageUrl).toBe('https://second.example.com/terms');
    expect(result.current.parsedOptions.logoPlacement).toBe('outside');
    expect(result.current.parsedOptions.showOptionalFields).toBe(true);
    expect(result.current.parsedOptions.socialButtonsPlacement).toBe('top');
    expect(result.current.parsedOptions.socialButtonsVariant).toBe('blockButton');
  });

  it('removes the baseTheme when simpleStyles is passed to globalAppearance', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        globalAppearance={{
          //@ts-expect-error not public api
          simpleStyles: true,
          elements: {
            alert: { backgroundColor: themeAColor },
          },
        }}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });
    //notice the "0" index, not "1" as it would be without simpleStyles
    expect(result.current.parsedElements[0]['alert'].backgroundColor).toBe(themeAColor);
  });

  it('removes the baseTheme when simpleStyles is passed to appearance', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        appearance={{
          //@ts-expect-error not public api
          simpleStyles: true,
          elements: {
            alert: { backgroundColor: themeBColor },
          },
        }}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });
    //notice the "0" index, not "1" as it would be without simpleStyles
    expect(result.current.parsedElements[0]['alert'].backgroundColor).toBe(themeBColor);
  });
});

describe('AppearanceProvider captcha', () => {
  it('sets the parsedCaptcha correctly from the globalAppearance prop', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        globalAppearance={{
          captcha: {
            theme: 'dark',
            size: 'compact',
            language: 'el-GR',
          },
        }}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });
    expect(result.current.parsedCaptcha.theme).toBe('dark');
    expect(result.current.parsedCaptcha.size).toBe('compact');
    expect(result.current.parsedCaptcha.language).toBe('el-GR');
  });

  it('sets the parsedCaptcha correctly from the appearance prop', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        appearance={{
          captcha: {
            theme: 'dark',
            size: 'compact',
            language: 'el-GR',
          },
        }}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });
    expect(result.current.parsedCaptcha.theme).toBe('dark');
    expect(result.current.parsedCaptcha.size).toBe('compact');
    expect(result.current.parsedCaptcha.language).toBe('el-GR');
  });

  it('sets the parsedOptions correctly from the globalAppearance and appearance prop', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        globalAppearance={{
          captcha: {
            theme: 'light',
            size: 'flexible',
            language: 'en-US',
          },
        }}
        appearance={{
          captcha: {
            theme: 'dark',
            size: 'compact',
            language: 'el-GR',
          },
        }}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });
    expect(result.current.parsedCaptcha.theme).toBe('dark');
    expect(result.current.parsedCaptcha.size).toBe('compact');
    expect(result.current.parsedCaptcha.language).toBe('el-GR');
  });

  it('uses the default values when no captcha property is passed', () => {
    const wrapper = ({ children }) => <AppearanceProvider appearanceKey='signIn'>{children}</AppearanceProvider>;

    const { result } = renderHook(() => useAppearance(), { wrapper });
    expect(result.current.parsedCaptcha.theme).toBe('auto');
    expect(result.current.parsedCaptcha.size).toBe('normal');
    expect(result.current.parsedCaptcha.language).toBe('');
  });
});

describe('AppearanceProvider theme flows', () => {
  it('supports string-based theme property with "clerk" value', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        appearance={{
          theme: 'clerk',
        }}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });
    // Should include clerk theme styles (baseTheme will be included)
    expect(result.current.parsedElements.length).toBeGreaterThan(0);
  });

  it('supports string-based theme property with "simple" value', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        appearance={{
          theme: 'simple',
        }}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });
    // Should include both simple theme and base theme (2 elements total)
    expect(result.current.parsedElements.length).toBe(2);
  });

  it('theme property takes precedence over deprecated baseTheme', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        appearance={{
          theme: 'simple',
          baseTheme: 'clerk', // This should be ignored
        }}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });
    // Should include both simple theme and base theme (2 elements total)
    expect(result.current.parsedElements.length).toBe(2);
  });

  it('maintains backward compatibility with baseTheme property', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        appearance={{
          baseTheme: 'simple',
        }}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });
    // Should work the same as theme: 'simple' (2 elements total)
    expect(result.current.parsedElements.length).toBe(2);
  });

  it('supports object-based themes with new theme property', () => {
    const customTheme = {
      elements: {
        card: { backgroundColor: 'red' },
      },
    };

    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        appearance={{
          theme: customTheme,
        }}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });
    // Should include base theme + custom theme
    expect(result.current.parsedElements.length).toBeGreaterThan(1);
    expect(result.current.parsedElements.some(el => el.card?.backgroundColor === 'red')).toBe(true);
  });

  it('supports array-based themes with new theme property', () => {
    const themeA = {
      elements: { card: { backgroundColor: 'red' } },
    };
    const themeB = {
      elements: { card: { color: 'blue' } },
    };

    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        appearance={{
          theme: [themeA, themeB],
        }}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });
    // Should include base theme + both custom themes
    expect(result.current.parsedElements.length).toBeGreaterThan(2);
    expect(result.current.parsedElements.some(el => el.card?.backgroundColor === 'red')).toBe(true);
    expect(result.current.parsedElements.some(el => el.card?.color === 'blue')).toBe(true);
  });
});
