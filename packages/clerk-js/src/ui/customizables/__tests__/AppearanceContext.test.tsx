// eslint-disable-next-line simple-import-sort/imports
import { render } from '../../../testUtils';
import React from 'react';

import { Box, useAppearance } from '..';
import { AppearanceProvider } from '../AppearanceContext';
import { renderHook } from '@testing-library/react';
import { knownColors } from '../testUtils';

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

  it('sets the theme correctly from the globalAppearance prop', () => {
    const wrapper = ({ children }: any) => (
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
    const wrapper = ({ children }: any) => (
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
    const wrapper = ({ children }: any) => (
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
