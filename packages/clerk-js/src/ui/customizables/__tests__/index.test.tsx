// eslint-disable-next-line simple-import-sort/imports
import { render, screen } from '../../../testUtils';
import React from 'react';

import { Box } from '..';
import { AppearanceProvider } from '../AppearanceContext';
import { knownColors } from '../testUtils';
import { InternalThemeProvider } from '../../styledSystem';

describe('Theme used in sx callback', () => {
  it('styles match the theme/globalAppearance', () => {
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

  it('styles match the theme/appearance', () => {
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

  it('styles match the merged result from globalAppearance and appearance', () => {
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
