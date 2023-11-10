// eslint-disable-next-line simple-import-sort/imports
import { render, screen } from '../../../testUtils';
import React from 'react';

import { Box, descriptors } from '..';
import { AppearanceProvider } from '../AppearanceContext';
import { knownColors } from './testUtils';
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

describe('Styles for specific elements', () => {
  it('styles propagate to the correct element specified', () => {
    render(
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
        <Box
          data-testid='test'
          elementDescriptor={descriptors.formButtonPrimary}
        />
      </AppearanceProvider>,
    );
    expect(screen.getByTestId('test')).toHaveStyleRule('background-color', 'yellow');
  });

  it('styles propagate to the correct element specified, including overriding styles when loading state is applied', () => {
    const wrapper = ({ children }) => (
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
    );

    const { rerender } = render(
      <Box
        data-testid='test'
        elementDescriptor={descriptors.formButtonPrimary}
      />,
      {
        wrapper,
      },
    );
    expect(getComputedStyle(screen.getByTestId('test')).backgroundColor).toBe('yellow');

    rerender(
      <Box
        data-testid='test'
        elementDescriptor={descriptors.formButtonPrimary}
        isLoading
      />,
    );
    expect(getComputedStyle(screen.getByTestId('test')).backgroundColor).toBe('red');
  });

  it('overrides styles when active state is applied', () => {
    const wrapper = ({ children }) => (
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
    );

    const { rerender } = render(
      <Box
        data-testid='test'
        elementDescriptor={descriptors.navbarButton}
      />,
      { wrapper },
    );
    expect(getComputedStyle(screen.getByTestId('test')).backgroundColor).toBe('yellow');

    rerender(
      <Box
        data-testid='test'
        elementDescriptor={descriptors.navbarButton}
        isActive
      />,
    );
    expect(getComputedStyle(screen.getByTestId('test')).backgroundColor).toBe('red');
  });

  it('overrides styles when error state is applied', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        globalAppearance={{
          elements: {
            navbarButton: {
              backgroundColor: 'yellow',
            },
            navbarButton__error: {
              backgroundColor: 'red',
            },
          },
        }}
      >
        {children}
      </AppearanceProvider>
    );

    const { rerender } = render(
      <Box
        data-testid='test'
        elementDescriptor={descriptors.navbarButton}
      />,
      {
        wrapper,
      },
    );
    expect(getComputedStyle(screen.getByTestId('test')).backgroundColor).toBe('yellow');

    rerender(
      <Box
        data-testid='test'
        elementDescriptor={descriptors.navbarButton}
        hasError
      />,
    );
    expect(getComputedStyle(screen.getByTestId('test')).backgroundColor).toBe('red');
  });

  it('overrides styles when open state is applied', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        globalAppearance={{
          elements: {
            navbarButton: {
              backgroundColor: 'yellow',
              '&:disabled': {
                backgroundColor: 'blue',
              },
            },
            navbarButton__open: {
              backgroundColor: 'red',
            },
          },
        }}
      >
        {children}
      </AppearanceProvider>
    );

    const { rerender } = render(
      <Box
        data-testid='test'
        elementDescriptor={descriptors.navbarButton}
      />,
      {
        wrapper,
      },
    );
    expect(getComputedStyle(screen.getByTestId('test')).backgroundColor).toBe('yellow');

    rerender(
      <Box
        data-testid='test'
        elementDescriptor={descriptors.navbarButton}
        isOpen
      />,
    );
    expect(getComputedStyle(screen.getByTestId('test')).backgroundColor).toBe('red');
  });

  it('overrides &:disabled styles when loading state is applied', () => {
    const wrapper = ({ children }) => (
      <AppearanceProvider
        appearanceKey='signIn'
        globalAppearance={{
          elements: {
            navbarButton: {
              backgroundColor: 'yellow',
              '&:disabled': {
                backgroundColor: 'blue',
              },
            },
            navbarButton__loading: {
              backgroundColor: 'red',
            },
          },
        }}
      >
        {children}
      </AppearanceProvider>
    );

    const { rerender } = render(
      <Box
        data-testid='test'
        elementDescriptor={descriptors.navbarButton}
      />,
      { wrapper },
    );

    expect(getComputedStyle(screen.getByTestId('test')).backgroundColor).toBe('yellow');

    rerender(
      <Box
        data-testid='test'
        elementDescriptor={descriptors.navbarButton}
        isLoading
      />,
    );
    expect(getComputedStyle(screen.getByTestId('test')).backgroundColor).toBe('red');
  });

  it('if a class is provided to the element via appearance, it adds the class to the element', () => {
    render(
      <AppearanceProvider
        appearanceKey='signIn'
        globalAppearance={{
          elements: {
            navbarButton: 'test-class',
            navbarButton__loading: {
              backgroundColor: 'red',
            },
          },
        }}
      >
        <Box
          data-testid='test'
          elementDescriptor={descriptors.navbarButton}
        />
        ,
      </AppearanceProvider>,
    );

    expect(screen.getByTestId('test')).toHaveClass('test-class');
  });
});
