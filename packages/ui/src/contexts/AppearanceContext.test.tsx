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
        layout: defaultAppearance.layout,
        elements: fullTheme,
        theme: fullTheme,
      },
      theme: undefined,
      themelessAppearance: null,
    });
  });

  it('factors in provided element styles', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppearanceProvider appearance={{ elements: { alert__warning: 'class-two' } }}>{children}</AppearanceProvider>
    );

    const { result } = renderHook(useAppearance, { wrapper });
    expect(result.current).toStrictEqual({
      parsedAppearance: {
        layout: defaultAppearance.layout,
        elements: {
          ...fullTheme,
          alert__warning: {
            descriptor: 'cl-alert__warning',
            className: [fullTheme.alert__warning.className, 'class-two'].join(' '),
            style: {},
          },
        },
        theme: fullTheme,
      },
      theme: undefined,
      themelessAppearance: {
        elements: {
          alert__warning: 'class-two',
        },
      },
    });
  });

  it('merges multiple appearance props', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppearanceProvider appearance={{ elements: { alert__warning: 'class-two' } }}>
        <AppearanceProvider appearance={{ elements: { alert__warning: 'class-three' } }}>{children}</AppearanceProvider>
      </AppearanceProvider>
    );

    const { result } = renderHook(useAppearance, { wrapper });
    expect(result.current).toStrictEqual({
      parsedAppearance: {
        layout: defaultAppearance.layout,
        elements: {
          ...fullTheme,
          alert__warning: {
            descriptor: 'cl-alert__warning',
            className: [fullTheme.alert__warning.className, 'class-two', 'class-three'].join(' '),
            style: {},
          },
        },
        theme: fullTheme,
      },
      theme: undefined,
      themelessAppearance: {
        elements: {
          alert__warning: 'class-two class-three',
        },
        layout: {},
      },
    });
  });

  it('overrides same properties with the nearest provider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppearanceProvider appearance={{ elements: { alert__warning: { background: 'tomato' } } }}>
        <AppearanceProvider appearance={{ elements: { alert__warning: { background: 'red' } } }}>
          {children}
        </AppearanceProvider>
      </AppearanceProvider>
    );

    const { result } = renderHook(useAppearance, { wrapper });
    expect(result.current).toStrictEqual({
      parsedAppearance: {
        layout: defaultAppearance.layout,
        elements: {
          ...fullTheme,
          alert__warning: {
            descriptor: 'cl-alert__warning',
            className: fullTheme.alert__warning.className,
            style: { background: 'red' },
          },
        },
        theme: fullTheme,
      },
      theme: undefined,
      themelessAppearance: {
        elements: {
          alert__warning: {
            background: 'red',
          },
        },
        layout: {},
      },
    });
  });

  it('propogates the provided baseTheme', () => {
    const testTheme = structuredClone(fullTheme);
    testTheme.alert__warning.className = 'alert-test-classname';

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppearanceProvider
        theme={testTheme}
        appearance={{ elements: { alert__warning: 'class-two' } }}
      >
        <AppearanceProvider appearance={{ elements: { alert__warning: 'class-three' } }}>{children}</AppearanceProvider>
      </AppearanceProvider>
    );

    const { result } = renderHook(useAppearance, { wrapper });
    expect(result.current.parsedAppearance.elements.alert__warning.className).toBe(
      'alert-test-classname class-two class-three',
    );
  });

  it('overrides the parent baseTheme', () => {
    const testTheme = structuredClone(fullTheme);
    testTheme.alert__warning.className = 'alert-test-classname';

    const childTheme = structuredClone(fullTheme);
    childTheme.alert__warning.className = 'alert-child-classname';

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppearanceProvider
        theme={testTheme}
        appearance={{ elements: { alert__warning: 'class-two' } }}
      >
        <AppearanceProvider
          theme={childTheme}
          appearance={{ elements: { alert__warning: 'class-three' } }}
        >
          {children}
        </AppearanceProvider>
      </AppearanceProvider>
    );

    const { result } = renderHook(useAppearance, { wrapper });
    expect(result.current.parsedAppearance.elements.alert__warning.className).toBe(
      'alert-child-classname class-two class-three',
    );
  });
});
