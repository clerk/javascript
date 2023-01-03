// eslint-disable-next-line simple-import-sort/imports
import { render } from '../../../testUtils';
import React from 'react';

import { Box, useAppearance } from '..';
import { AppearanceProvider } from '../AppearanceContext';
import { renderHook } from '@testing-library/react';
import { knownColors } from './testUtils';

const themeAColor = 'blue';
const themeA = {
  variables: {
    colorPrimary: themeAColor,
    colorDanger: themeAColor,
    colorSuccess: themeAColor,
    colorWarning: themeAColor,
    colorBackground: themeAColor,
    colorInputBackground: themeAColor,
    colorInputText: themeAColor,
    colorText: themeAColor,
    colorTextOnPrimaryBackground: themeAColor,
    colorTextSecondary: themeAColor,
    borderRadius: '1rem',
    fontFamily: 'Comic Sans',
    fontFamilyButtons: 'Comic Sans',
    fontSize: '1rem',
    fontWeight: { normal: 600 },
    fontSmoothing: 'antialiased',
    spacingUnit: 'px',
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
    colorInputBackground: themeBColor,
    colorInputText: themeBColor,
    colorText: themeBColor,
    colorTextOnPrimaryBackground: themeBColor,
    colorTextSecondary: themeBColor,
    borderRadius: '2rem',
    fontFamily: 'Arial',
    fontFamilyButtons: 'Arial',
    fontSize: '2rem',
    fontWeight: { normal: 700 },
    fontSmoothing: 'never',
    spacingUnit: 'px',
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
    expect(result.current.parsedInternalTheme.colors.$colorInputBackground).toBe(knownColors[themeAColor]);
    expect(result.current.parsedInternalTheme.colors.$colorInputText).toBe(knownColors[themeAColor]);
    expect(result.current.parsedInternalTheme.colors.$colorText).toBe(knownColors[themeAColor]);
    expect(result.current.parsedInternalTheme.colors.$colorTextOnPrimaryBackground).toBe(knownColors[themeAColor]);
    expect(result.current.parsedInternalTheme.colors.$colorTextSecondary).toBe(knownColors[themeAColor]);
    expect(result.current.parsedInternalTheme.radii.$md).toBe(themeA.variables.borderRadius);
    expect(result.current.parsedInternalTheme.fonts.$main).toBe(themeA.variables.fontFamily);
    expect(result.current.parsedInternalTheme.fonts.$buttons).toBe(themeA.variables.fontFamily);
    expect(result.current.parsedInternalTheme.fontSizes.$md).toBe(themeA.variables.fontSize);
    expect(result.current.parsedInternalTheme.fontWeights.$normal).toBe(themeA.variables.fontWeight.normal);
    expect(result.current.parsedInternalTheme.options.$fontSmoothing).toBe(themeA.variables.fontSmoothing);
    expect(result.current.parsedInternalTheme.space.$1).toContain(themeA.variables.spacingUnit);
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
    expect(result.current.parsedInternalTheme.colors.$colorInputBackground).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$colorInputText).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$colorText).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$colorTextOnPrimaryBackground).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$colorTextSecondary).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.radii.$md).toBe(themeB.variables.borderRadius);
    expect(result.current.parsedInternalTheme.fonts.$main).toBe(themeB.variables.fontFamily);
    expect(result.current.parsedInternalTheme.fonts.$buttons).toBe(themeB.variables.fontFamily);
    expect(result.current.parsedInternalTheme.fontSizes.$md).toBe(themeB.variables.fontSize);
    expect(result.current.parsedInternalTheme.fontWeights.$normal).toBe(themeB.variables.fontWeight.normal);
    expect(result.current.parsedInternalTheme.options.$fontSmoothing).toBe(themeB.variables.fontSmoothing);
    expect(result.current.parsedInternalTheme.space.$1).toContain(themeB.variables.spacingUnit);
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
    expect(result.current.parsedInternalTheme.colors.$colorInputBackground).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$colorInputText).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$colorText).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$colorTextOnPrimaryBackground).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.colors.$colorTextSecondary).toBe(knownColors[themeBColor]);
    expect(result.current.parsedInternalTheme.radii.$md).toBe(themeB.variables.borderRadius);
    expect(result.current.parsedInternalTheme.fonts.$main).toBe(themeB.variables.fontFamily);
    expect(result.current.parsedInternalTheme.fonts.$buttons).toBe(themeB.variables.fontFamily);
    expect(result.current.parsedInternalTheme.fontSizes.$md).toBe(themeB.variables.fontSize);
    expect(result.current.parsedInternalTheme.fontWeights.$normal).toBe(themeB.variables.fontWeight.normal);
    expect(result.current.parsedInternalTheme.options.$fontSmoothing).toBe(themeB.variables.fontSmoothing);
    expect(result.current.parsedInternalTheme.space.$1).toContain(themeB.variables.spacingUnit);
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
    expect(result.current.parsedElements[0]['alert'].backgroundColor).toBe(themeAColor);
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
    expect(result.current.parsedElements[0]['alert'].backgroundColor).toBe(themeAColor);
    expect(result.current.parsedElements[1]['alert'].backgroundColor).toBe(themeBColor);
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
    expect(result.current.parsedElements[0]['alert'].backgroundColor).toBe(knownColors[themeAColor]);
  });
});

describe('AppearanceProvider layout flows', () => {
  it('sets the parsedLayout correctly from the globalAppearance prop', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        globalAppearance={{
          layout: {
            helpPageUrl: 'test',
            logoImageUrl: 'test',
            privacyPageUrl: 'test',
            termsPageUrl: 'test',
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
    expect(result.current.parsedLayout.helpPageUrl).toBe('test');
    expect(result.current.parsedLayout.logoImageUrl).toBe('test');
    expect(result.current.parsedLayout.privacyPageUrl).toBe('test');
    expect(result.current.parsedLayout.termsPageUrl).toBe('test');
    expect(result.current.parsedLayout.logoPlacement).toBe('inside');
    expect(result.current.parsedLayout.showOptionalFields).toBe(false);
    expect(result.current.parsedLayout.socialButtonsPlacement).toBe('bottom');
    expect(result.current.parsedLayout.socialButtonsVariant).toBe('iconButton');
  });

  it('sets the parsedLayout correctly from the appearance prop', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        appearance={{
          layout: {
            helpPageUrl: 'test2',
            logoImageUrl: 'test2',
            privacyPageUrl: 'test2',
            termsPageUrl: 'test2',
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
    expect(result.current.parsedLayout.helpPageUrl).toBe('test2');
    expect(result.current.parsedLayout.logoImageUrl).toBe('test2');
    expect(result.current.parsedLayout.privacyPageUrl).toBe('test2');
    expect(result.current.parsedLayout.termsPageUrl).toBe('test2');
    expect(result.current.parsedLayout.logoPlacement).toBe('outside');
    expect(result.current.parsedLayout.showOptionalFields).toBe(true);
    expect(result.current.parsedLayout.socialButtonsPlacement).toBe('top');
    expect(result.current.parsedLayout.socialButtonsVariant).toBe('blockButton');
  });

  it('sets the parsedLayout correctly from the globalAppearance and appearance prop', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        globalAppearance={{
          layout: {
            helpPageUrl: 'test',
            logoImageUrl: 'test',
            privacyPageUrl: 'test',
            termsPageUrl: 'test',
            logoPlacement: 'inside',
            showOptionalFields: false,
            socialButtonsPlacement: 'bottom',
            socialButtonsVariant: 'iconButton',
          },
        }}
        appearance={{
          layout: {
            helpPageUrl: 'test2',
            logoImageUrl: 'test2',
            privacyPageUrl: 'test2',
            termsPageUrl: 'test2',
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
    expect(result.current.parsedLayout.helpPageUrl).toBe('test2');
    expect(result.current.parsedLayout.logoImageUrl).toBe('test2');
    expect(result.current.parsedLayout.privacyPageUrl).toBe('test2');
    expect(result.current.parsedLayout.termsPageUrl).toBe('test2');
    expect(result.current.parsedLayout.logoPlacement).toBe('outside');
    expect(result.current.parsedLayout.showOptionalFields).toBe(true);
    expect(result.current.parsedLayout.socialButtonsPlacement).toBe('top');
    expect(result.current.parsedLayout.socialButtonsVariant).toBe('blockButton');
  });
});
