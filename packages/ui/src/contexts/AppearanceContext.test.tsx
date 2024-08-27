import type { ReactNode } from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { fullTheme } from '~/themes';
import { AppearanceProvider, useAppearance, defaultAppearance } from './AppearanceContext';

describe('AppearanceContext', () => {
  it('renders expected defaults', () => {
    const wrapper = ({ children }: { children: ReactNode }) => <AppearanceProvider>{children}</AppearanceProvider>;

    const { result } = renderHook(useAppearance, { wrapper });
    expect(result.current).toStrictEqual({
      parsedAppearance: {
        layout: defaultAppearance.layout,
        elements: defaultAppearance.elements,
        theme: defaultAppearance.theme,
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
          ...defaultAppearance.elements,
          alert__warning: {
            descriptor: 'cl-alert__warning',
            className: [defaultAppearance.elements.alert__warning.className, 'class-two'].join(' '),
            style: {},
          },
        },
        theme: defaultAppearance.theme,
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
          ...defaultAppearance.elements,
          alert__warning: {
            descriptor: 'cl-alert__warning',
            className: [defaultAppearance.elements.alert__warning.className, 'class-two', 'class-three'].join(' '),
            style: {},
          },
        },
        theme: defaultAppearance.theme,
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
