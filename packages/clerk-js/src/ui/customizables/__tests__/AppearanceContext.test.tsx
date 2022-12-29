// eslint-disable-next-line simple-import-sort/imports
import { render, screen } from '../../../testUtils';
import React from 'react';

import { Box, useAppearance } from '..';
import { AppearanceProvider } from '../AppearanceContext';
import { renderHook } from '@testing-library/react';
import { knownColors } from '../testUtils';
import { InternalThemeProvider } from '../../styledSystem';

describe('AppearanceContext', () => {
  it('renders the provider', () => {
    render(
      <AppearanceProvider appearanceKey='signIn'>
        <Box />
      </AppearanceProvider>,
    );
  });

  it('tests hook with global appearance', () => {
    const wrapper = ({ children }: any) => (
      <AppearanceProvider
        appearanceKey='signIn'
        globalAppearance={{ variables: { colorPrimary: 'blue' } }}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });
    expect(result.current.parsedInternalTheme.colors.$primary500).toBe(knownColors.blue);
  });

  it('tests hook with appearance', () => {
    const wrapper = ({ children }: any) => (
      <AppearanceProvider
        appearanceKey='signIn'
        appearance={{ variables: { colorPrimary: 'blue' } }}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });
    expect(result.current.parsedInternalTheme.colors.$primary500).toBe(knownColors.blue);
  });

  it('tests hook with both globalAppearance and appearance', () => {
    const wrapper = ({ children }: any) => (
      <AppearanceProvider
        appearanceKey='signIn'
        globalAppearance={{ variables: { colorPrimary: 'blue' } }}
        appearance={{ variables: { colorPrimary: 'red' } }}
      >
        {children}
      </AppearanceProvider>
    );

    const { result } = renderHook(() => useAppearance(), { wrapper });
    expect(result.current.parsedInternalTheme.colors.$primary500).toBe(knownColors.red);
  });
});

describe('Appearance Context e2e', () => {
  it('tests that theme is set by globalAppearance', () => {
    render(
      <AppearanceProvider
        appearanceKey='signIn'
        globalAppearance={{ variables: { colorPrimary: 'blue' } }}
      >
        <InternalThemeProvider>
          <Box
            sx={t => ({ backgroundColor: t.colors.$primary500 })}
            data-testid='test'
          />
        </InternalThemeProvider>
      </AppearanceProvider>,
    );

    expect(screen.getByTestId('test')).toHaveStyleRule('background-color', knownColors.blue);
  });

  it('tests that theme is set by appearance', () => {
    render(
      <AppearanceProvider
        appearanceKey='signIn'
        appearance={{ variables: { colorPrimary: 'red' } }}
      >
        <InternalThemeProvider>
          <Box
            sx={t => ({ backgroundColor: t.colors.$primary500 })}
            data-testid='test'
          />
        </InternalThemeProvider>
      </AppearanceProvider>,
    );

    expect(screen.getByTestId('test')).toHaveStyleRule('background-color', knownColors.red);
  });

  it('tests that theme overrides work', () => {
    render(
      <AppearanceProvider
        appearanceKey='signIn'
        globalAppearance={{ variables: { colorPrimary: 'blue' } }}
        appearance={{ variables: { colorPrimary: 'red' } }}
      >
        <InternalThemeProvider>
          <Box
            sx={t => ({ backgroundColor: t.colors.$primary500 })}
            data-testid='test'
          />
        </InternalThemeProvider>
      </AppearanceProvider>,
    );

    expect(screen.getByTestId('test')).toHaveStyleRule('background-color', knownColors.red);
  });
});
