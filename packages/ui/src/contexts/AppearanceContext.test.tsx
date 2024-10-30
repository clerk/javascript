import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { fullTheme } from '~/themes';

import { AppearanceProvider, defaultAppearance, useAppearance } from './AppearanceContext';

describe('AppearanceContext', () => {
  it('renders expected defaults', () => {
    const wrapper = ({ children }: { children: ReactNode }) => <AppearanceProvider>{children}</AppearanceProvider>;

    const { result } = renderHook(useAppearance, { wrapper });
    expect(result.current).toStrictEqual({
      parsedAppearance: {
        options: defaultAppearance.options,
        elements: fullTheme,
        theme: fullTheme,
      },
      theme: undefined,
      themelessAppearance: null,
    });
  });

  it('factors in provided element styles', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppearanceProvider appearance={{ elements: { alertWarning: 'class-two' } }}>{children}</AppearanceProvider>
    );

    const { result } = renderHook(useAppearance, { wrapper });
    expect(result.current).toStrictEqual({
      parsedAppearance: {
        options: defaultAppearance.options,
        elements: {
          ...fullTheme,
          alertWarning: {
            descriptor: 'cl-alertWarning',
            className: [fullTheme.alertWarning.className, 'class-two'].join(' '),
            style: {},
          },
        },
        theme: fullTheme,
      },
      theme: undefined,
      themelessAppearance: {
        elements: {
          alertWarning: 'class-two',
        },
      },
    });
  });

  it('merges multiple appearance props', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppearanceProvider appearance={{ elements: { alertWarning: 'class-two' } }}>
        <AppearanceProvider appearance={{ elements: { alertWarning: 'class-three' } }}>{children}</AppearanceProvider>
      </AppearanceProvider>
    );

    const { result } = renderHook(useAppearance, { wrapper });
    expect(result.current).toStrictEqual({
      parsedAppearance: {
        options: defaultAppearance.options,
        elements: {
          ...fullTheme,
          alertWarning: {
            descriptor: 'cl-alertWarning',
            className: [fullTheme.alertWarning.className, 'class-two', 'class-three'].join(' '),
            style: {},
          },
        },
        theme: fullTheme,
      },
      theme: undefined,
      themelessAppearance: {
        elements: {
          alertWarning: 'class-two class-three',
        },
        options: {},
      },
    });
  });

  it('overrides same properties with the nearest provider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppearanceProvider appearance={{ elements: { alertWarning: { background: 'tomato' } } }}>
        <AppearanceProvider appearance={{ elements: { alertWarning: { background: 'red' } } }}>
          {children}
        </AppearanceProvider>
      </AppearanceProvider>
    );

    const { result } = renderHook(useAppearance, { wrapper });
    expect(result.current).toStrictEqual({
      parsedAppearance: {
        options: defaultAppearance.options,
        elements: {
          ...fullTheme,
          alertWarning: {
            descriptor: 'cl-alertWarning',
            className: fullTheme.alertWarning.className,
            style: { background: 'red' },
          },
        },
        theme: fullTheme,
      },
      theme: undefined,
      themelessAppearance: {
        elements: {
          alertWarning: {
            background: 'red',
          },
        },
        options: {},
      },
    });
  });

  it('propogates the provided baseTheme', () => {
    const testTheme = structuredClone(fullTheme);
    testTheme.alertWarning.className = 'alert-test-classname';

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppearanceProvider
        theme={testTheme}
        appearance={{ elements: { alertWarning: 'class-two' } }}
      >
        <AppearanceProvider appearance={{ elements: { alertWarning: 'class-three' } }}>{children}</AppearanceProvider>
      </AppearanceProvider>
    );

    const { result } = renderHook(useAppearance, { wrapper });
    expect(result.current.parsedAppearance.elements.alertWarning.className).toBe(
      'alert-test-classname class-two class-three',
    );
  });

  it('overrides the parent baseTheme', () => {
    const testTheme = structuredClone(fullTheme);
    testTheme.alertWarning.className = 'alert-test-classname';

    const childTheme = structuredClone(fullTheme);
    childTheme.alertWarning.className = 'alert-child-classname';

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppearanceProvider
        theme={testTheme}
        appearance={{ elements: { alertWarning: 'class-two' } }}
      >
        <AppearanceProvider
          theme={childTheme}
          appearance={{ elements: { alertWarning: 'class-three' } }}
        >
          {children}
        </AppearanceProvider>
      </AppearanceProvider>
    );

    const { result } = renderHook(useAppearance, { wrapper });
    expect(result.current.parsedAppearance.elements.alertWarning.className).toBe(
      'alert-child-classname class-two class-three',
    );
  });
});
