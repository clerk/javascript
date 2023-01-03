// eslint-disable-next-line simple-import-sort/imports
import { bindCreateFixtures, render, screen } from '../../../testUtils';
import React from 'react';

import { Box, Button, descriptors } from '..';
import { AppearanceProvider } from '../AppearanceContext';
import { knownColors } from './testUtils';
import { InternalThemeProvider } from '../../styledSystem';

const { createFixtures } = bindCreateFixtures('SignIn');

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

describe('Styles for specific elements', () => {
  it('styles propagate to the correct element specified', async () => {
    const { wrapper: Wrapper } = await createFixtures();

    render(
      <Button
        data-testid='test'
        elementDescriptor={descriptors.formButtonPrimary}
      />,
      {
        wrapper: ({ children }) => (
          <Wrapper>
            <AppearanceProvider
              appearanceKey='signIn'
              globalAppearance={{
                elements: {
                  formButtonPrimary: {
                    backgroundColor: 'yellow',
                  },
                },
              }}
            >
              {children}
            </AppearanceProvider>
          </Wrapper>
        ),
      },
    );
    expect(screen.getByTestId('test')).toHaveStyleRule('background-color', 'yellow');
  });

  it('styles propagate to the correct element specified, including overriding styles when loading state is applied', async () => {
    const { wrapper: Wrapper } = await createFixtures();

    const { rerender } = render(
      <Button
        data-testid='test'
        elementDescriptor={descriptors.formButtonPrimary}
      />,
      {
        wrapper: ({ children }) => (
          <Wrapper>
            <AppearanceProvider
              appearanceKey='signIn'
              globalAppearance={{
                elements: {
                  formButtonPrimary: {
                    backgroundColor: 'yellow',
                  },
                  formButtonPrimary__loading: {
                    backgroundColor: 'red',
                  },
                },
              }}
            >
              {children}
            </AppearanceProvider>
          </Wrapper>
        ),
      },
    );
    expect(getComputedStyle(screen.getByTestId('test')).backgroundColor).toBe('yellow');

    rerender(
      <Button
        data-testid='test'
        elementDescriptor={descriptors.formButtonPrimary}
        isLoading={true}
      />,
    );
    expect(getComputedStyle(screen.getByTestId('test')).backgroundColor).toBe('red');
  });

  it('overrides styles when active state is applied', async () => {
    const { wrapper: Wrapper } = await createFixtures();

    const { rerender } = render(
      <Button
        data-testid='test'
        elementDescriptor={descriptors.navbarButton}
      />,
      {
        wrapper: ({ children }) => (
          <Wrapper>
            <AppearanceProvider
              appearanceKey='signIn'
              globalAppearance={{
                elements: {
                  navbarButton: {
                    backgroundColor: 'yellow',
                  },
                  navbarButton__active: {
                    backgroundColor: 'red',
                  },
                },
              }}
            >
              {children}
            </AppearanceProvider>
          </Wrapper>
        ),
      },
    );
    expect(getComputedStyle(screen.getByTestId('test')).backgroundColor).toBe('yellow');

    rerender(
      <Button
        data-testid='test'
        elementDescriptor={descriptors.navbarButton}
        isActive={true}
      />,
    );
    expect(getComputedStyle(screen.getByTestId('test')).backgroundColor).toBe('red');
  });

  it.todo('overrides styles when error state is applied');
  it.todo('overrides styles when open state is applied');
});
