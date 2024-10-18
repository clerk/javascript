import { createContextAndHook, useDeepEqualMemo } from '@clerk/shared/react';
import type {
  Appearance as CurrentAppearance,
  Layout as CurrentLayout,
  OAuthProvider,
  Web3Provider,
} from '@clerk/types';
import React from 'react';

import { fullTheme } from '~/themes';

type Provider = OAuthProvider | Web3Provider;

type AlertDescriptorIdentifier = 'alert' | 'alert__error' | 'alert__warning' | 'alertIcon';
type ButtonDescriptorIdentifier =
  | 'button'
  | 'buttonPrimary'
  | 'buttonSecondary'
  | 'buttonConnection'
  | 'buttonPrimaryDefault'
  | 'buttonSecondaryDefault'
  | 'buttonConnectionDefault'
  | `buttonConnection__${Provider}`
  | 'buttonDisabled'
  | 'buttonBusy'
  | 'buttonText'
  | 'buttonTextVisuallyHidden'
  | 'buttonIcon'
  | 'buttonIconStart'
  | 'buttonIconEnd'
  | 'buttonSpinner';
type ConnectionDescriptorIdentifier = 'connectionList' | 'connectionListItem';
type SeparatorDescriptorIdentifier = 'separator';
type SpinnerDescriptorIdentifier = 'spinner';
type CardDescriptorIdentifier =
  | 'cardRoot'
  | 'cardRootDefault'
  | 'cardRootInner'
  | 'cardHeader'
  | 'cardContent'
  | 'cardTitle'
  | 'cardDescription'
  | 'cardBody'
  | 'cardActions'
  | 'cardFooter'
  | 'cardFooterAction'
  | 'cardFooterActionText'
  | 'cardFooterActionLink'
  | 'cardFooterActionButton'
  | 'cardFooterActionPageLink'
  | 'cardLogoBox'
  | 'cardLogoLink'
  | 'cardLogoImage';

/**
 * Union of all valid descriptors used throughout the components.
 */
export type DescriptorIdentifier =
  | AlertDescriptorIdentifier
  | ButtonDescriptorIdentifier
  | ConnectionDescriptorIdentifier
  | SeparatorDescriptorIdentifier
  | SpinnerDescriptorIdentifier
  | CardDescriptorIdentifier;

/**
 * The final resulting descriptor that gets passed to mergeDescriptors and spread on the element.
 */
export type ParsedDescriptor = { descriptor: string; className: string; style: React.CSSProperties };

/**
 * The authoring format value type for styles written within a component. Essentially { className?: string, style?: CSSProperties }
 */
export type PartialDescriptor = Omit<Partial<ParsedDescriptor>, 'descriptor'>;

/**
 * A full theme generated from merging ParsedElementsFragments. Has entries for each descriptor, but they're not complete.
 */
export type PartialTheme = Record<DescriptorIdentifier, PartialDescriptor>;

/**
 * A subset of a partial theme. This is the type used when authoring style objects within a component.
 */
export type ParsedElementsFragment = Partial<PartialTheme>;

/**
 * A full theme, complete with descriptors. This is the value returned from useAppearance().parsedAppearance, and is
 * the main type interacted with within components.
 */
export type ParsedElements = Record<DescriptorIdentifier, ParsedDescriptor>;
export type ParsedOptions = Omit<CurrentLayout, 'logoPlacement'> & {
  logoVisibility?: 'visible' | 'hidden';
};

type ElementsAppearanceConfig = string | (React.CSSProperties & { className?: string });

export type Appearance = Omit<CurrentAppearance, 'elements' | 'baseTheme' | 'layout'> & {
  theme?: ParsedElements;
  elements?: Partial<Record<DescriptorIdentifier, ElementsAppearanceConfig>>;
  options?: ParsedOptions;
};

export type AppearanceCascade = {
  globalAppearance?: ParsedAppearance;
  appearance?: Appearance;
};

/**
 * The generated appearance calculated from defaults and user-provided values. This is the type used to access computed
 * appearance values, and as such will always have a value for a given key.
 */
export type ParsedAppearance = {
  theme: ParsedElements;
  elements: ParsedElements;
  options: ParsedOptions;
};

type AppearanceContextValue = {
  /**
   * The calculated appearance value based on the provided `appearance` and `globalAppearance`.
   *
   * Example:
   * ```tsx
   * function Help() {
   *   const { options } = useAppearance().parsedAppearance;
   *   return <p>{options.helpPageUrl}</p>
   * }
   * ```
   */
  parsedAppearance: ParsedAppearance;
  themelessAppearance: Appearance | null;
  theme?: ParsedElements;
};

/**
 * Used to merge full themes with ParsedElementsFragments. Allows you to combine optionsStyle with multiple visualStyle
 * elements.
 */
export function mergeParsedElementsFragment(...fragments: ParsedElementsFragment[]): ParsedElementsFragment {
  const acc: ParsedElementsFragment = {};

  fragments.forEach(fragment => {
    for (const k in fragment) {
      const key = k as keyof ParsedElementsFragment;
      if (key in acc) {
        acc[key]!.className = [acc[key]?.className, fragment[key]?.className].join(' ');
        acc[key]!.style = {
          ...acc[key]!.style,
          ...fragment[key]?.style,
        };
      } else {
        acc[key] = {
          className: fragment[key]?.className,
          style: fragment[key]?.style,
        };
      }
    }
  });

  return acc;
}

/**
 * Used within components to merge multiple descriptors onto a single element. Result is directly spread onto the element.
 */
export function mergeDescriptors(...descriptors: (ParsedDescriptor | boolean)[]): PartialDescriptor {
  return descriptors.reduce<PartialDescriptor>(
    (acc, el) => {
      if (typeof el === 'boolean') {
        return acc;
      }
      acc.className = [el.descriptor, acc.className, el.className].join(' ');
      acc.style = { ...acc.style, ...el.style };
      return acc;
    },
    { className: '', style: {} },
  );
}

function mergeElementsAppearanceConfig(
  a: ElementsAppearanceConfig,
  b: ElementsAppearanceConfig,
): ElementsAppearanceConfig {
  let result: ElementsAppearanceConfig | undefined;
  if (typeof a === 'string' && typeof b === 'string') {
    result = [a, b].join(' ');
  } else if (typeof a === 'string' && typeof b === 'object') {
    result = { ...b };
    result.className = [result.className, a].join(' ');
  } else if (typeof a === 'object' && typeof b === 'string') {
    result = { ...a };
    result.className = [result.className, b].join(' ');
  } else if (typeof a === 'object' && typeof b === 'object') {
    result = {
      ...a,
      ...b,
    };
    if (a.className || b.className) {
      result.className = [a.className, b.className].filter(Boolean).join(' ');
    }
  }

  if (!result) {
    throw new Error(`Unable to merge ElementsAppearanceConfigs: ${JSON.stringify(a)} and ${JSON.stringify(b)}`);
  }

  return result;
}

function mergeAppearance(a: Appearance | null | undefined, b: Appearance | null | undefined): Appearance | null {
  if (!a && !b) {
    return null;
  }
  if (!a) {
    return b!;
  }
  if (!b) {
    return a;
  }

  const result = { ...a, options: { ...a.options, ...b.options } }; // Ensure options are merged

  if (b.theme) {
    result.theme = b.theme;
  }

  if (!result.elements && b.elements) {
    result.elements = { ...b.elements };
  } else if (result.elements && b.elements) {
    Object.entries(b.elements).forEach(([element, config]) => {
      const el = element as DescriptorIdentifier;
      if (el in result.elements!) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        result.elements![el] = mergeElementsAppearanceConfig(result.elements![el]!, config!);
      } else {
        result.elements![el] = config;
      }
    });
  }

  return result;
}

function applyTheme(theme: ParsedElements | undefined, appearance: Appearance | null): ParsedAppearance {
  const baseTheme = theme ?? fullTheme;
  if (!appearance) {
    return { theme: baseTheme, elements: structuredClone(baseTheme), options: defaultAppearance.options };
  }

  const result = {
    theme: baseTheme,
    // because we're going to perform modifications to deeply nested objects, we need to create a structuredClone of
    // the theme or else subsequent usage of the baseTheme will contain our merged changes.
    elements: structuredClone(baseTheme),
    options: { ...defaultAppearance.options, ...appearance.options },
  };

  if (appearance.elements) {
    Object.entries(appearance.elements).forEach(([element, config]) => {
      const el = element as DescriptorIdentifier;
      if (el in appearance.elements!) {
        if (typeof config === 'string') {
          result.elements[el].className = [result.elements[el].className, config].join(' ');
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          const { className, ...style } = config!;
          if (className) {
            result.elements[el].className = [result.elements[el].className, className].join(' ');
          }
          result.elements[el].style = { ...result.elements[el].style, ...style };
        }
      }
    });
  }

  return result;
}

export const defaultAppearance: ParsedAppearance = {
  theme: fullTheme,
  elements: fullTheme,
  options: {
    logoVisibility: 'visible',
    socialButtonsPlacement: 'top',
    socialButtonsVariant: 'auto',
    logoImageUrl: '',
    logoLinkUrl: '',
    showOptionalFields: true,
    helpPageUrl: '',
    privacyPageUrl: '',
    termsPageUrl: '',
    shimmer: true,
    animations: true,
    unsafe_disableDevelopmentModeWarnings: false,
  },
};

const [AppearanceContext, useAppearance, usePartialAppearance] =
  createContextAndHook<AppearanceContextValue>('AppearanceContext');

type AppearanceProviderProps = React.PropsWithChildren<{ appearance?: Appearance; theme?: ParsedElements }>;

/**
 * Used to provide appearance values throughout an application. In typical usage, the entire application will be
 * wrapped in an `AppearanceProvider` to provide global configuration. Each top-level AIO component that accepts an
 * `appearance` prop will wrap its children in `AppearanceProvider`. The provider handles the merging of attributes,
 * and makes them available via the `useAppearance` hook.
 */
const AppearanceProvider = (props: AppearanceProviderProps) => {
  // Access the parsedAppearance of the parent context provider. `undefined` if this is the top-most
  // AppearanceProvider.
  const {
    parsedAppearance: globalAppearance,
    themelessAppearance: globalThemelessAppearance,
    theme: globalTheme,
  } = usePartialAppearance();

  const ctxValue = useDeepEqualMemo(() => {
    const theme = props.theme ?? globalTheme;
    const themelessAppearance = mergeAppearance(globalThemelessAppearance, props.appearance);
    const parsedAppearance = applyTheme(theme, themelessAppearance);

    return { value: { parsedAppearance, themelessAppearance, theme: props.theme ?? globalTheme } };
  }, [props.appearance, props.theme, globalAppearance, globalThemelessAppearance, globalTheme]);

  return <AppearanceContext.Provider value={ctxValue}>{props.children}</AppearanceContext.Provider>;
};

export { AppearanceProvider, useAppearance };

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest;

  describe('mergeAppearance', () => {
    it('retains keys from both appearances', () => {
      const a = { elements: { alert__warning: 'cl-test-class-one' } };
      const b = { elements: { alertIcon: 'cl-test-class-two' } };
      expect(mergeAppearance(a, b)).toStrictEqual({
        options: {},
        elements: {
          alert__warning: 'cl-test-class-one',
          alertIcon: 'cl-test-class-two',
        },
      });
    });

    it('retains the theme prop', () => {
      const a = { theme: fullTheme, elements: { alert__warning: 'cl-test-class-one' } };
      const b = {
        elements: { alertIcon: 'cl-test-class-two' },
      };
      expect(mergeAppearance(a, b)).toStrictEqual({
        options: {},
        theme: a.theme,
        elements: {
          alert__warning: 'cl-test-class-one',
          alertIcon: 'cl-test-class-two',
        },
      });
    });

    it('overrides the theme prop', () => {
      const a = { theme: fullTheme, elements: { alert__warning: 'cl-test-class-one' } };
      const b = {
        theme: { ...fullTheme, alertIcon: { descriptor: 'test', className: 'cl-test-class', style: {} } },
        elements: { alertIcon: 'cl-test-class-two' },
      };
      expect(mergeAppearance(a, b)).toStrictEqual({
        options: {},
        theme: b.theme,
        elements: {
          alert__warning: 'cl-test-class-one',
          alertIcon: 'cl-test-class-two',
        },
      });
    });

    it('merges string values for the same element', () => {
      const a = { elements: { alert__warning: 'cl-test-class-one' } };
      const b = { elements: { alert__warning: 'cl-test-class-two' } };
      expect(mergeAppearance(a, b)).toStrictEqual({
        options: {},
        elements: {
          alert__warning: 'cl-test-class-one cl-test-class-two',
        },
      });
    });

    it('merges object values for the same element', () => {
      const a = { elements: { alert__warning: { background: 'tomato' } } };
      const b = { elements: { alert__warning: { color: 'red' } } };
      expect(mergeAppearance(a, b)).toStrictEqual({
        options: {},
        elements: {
          alert__warning: { color: 'red', background: 'tomato' },
        },
      });
    });

    it('overrides same style properties', () => {
      const a = { elements: { alert__warning: { background: 'tomato' } } };
      const b = { elements: { alert__warning: { background: 'red' } } };
      expect(mergeAppearance(a, b)).toStrictEqual({
        options: {},
        elements: {
          alert__warning: { background: 'red' },
        },
      });
    });
  });

  describe('mergeElementsAppearanceConfig', () => {
    it('merges two strings', () => {
      const a = 'cl-test-class-one';
      const b = 'cl-test-class-two';
      expect(mergeElementsAppearanceConfig(a, b)).toBe('cl-test-class-one cl-test-class-two');
    });

    it('merges a string and an object', () => {
      const a = 'cl-test-class-one';
      const b = { className: 'cl-test-class-two' };
      expect(mergeElementsAppearanceConfig(a, b)).toStrictEqual({ className: 'cl-test-class-two cl-test-class-one' });
    });

    it('merges an object and a string', () => {
      const a = { className: 'cl-test-class-one' };
      const b = 'cl-test-class-two';
      expect(mergeElementsAppearanceConfig(a, b)).toStrictEqual({ className: 'cl-test-class-one cl-test-class-two' });
    });

    it('merges two objects', () => {
      const a = { className: 'cl-test-class-one' };
      const b = { className: 'cl-test-class-two' };
      expect(mergeElementsAppearanceConfig(a, b)).toStrictEqual({ className: 'cl-test-class-one cl-test-class-two' });
    });

    it('merges a string and an object with style', () => {
      const a = 'cl-test-class-one';
      const b = { className: 'cl-test-class-two', backgroundColor: 'tomato' };
      expect(mergeElementsAppearanceConfig(a, b)).toStrictEqual({
        className: 'cl-test-class-two cl-test-class-one',
        backgroundColor: 'tomato',
      });
    });

    it('merges two objects with styles', () => {
      const a = { className: 'cl-test-class-one', color: 'red' };
      const b = { className: 'cl-test-class-two', backgroundColor: 'tomato' };
      expect(mergeElementsAppearanceConfig(a, b)).toStrictEqual({
        className: 'cl-test-class-one cl-test-class-two',
        color: 'red',
        backgroundColor: 'tomato',
      });
    });

    it('correctly omits className if not present', () => {
      const a = { color: 'red' };
      const b = { backgroundColor: 'tomato' };
      expect(mergeElementsAppearanceConfig(a, b)).toStrictEqual({
        color: 'red',
        backgroundColor: 'tomato',
      });
    });
  });

  describe('applyTheme', () => {
    it('adds classNames from theme', () => {
      const appearance = {
        elements: {
          alert__warning: 'cl-test-1',
        },
      };
      const theme = {
        ...fullTheme,
        alert__warning: { descriptor: 'test', className: 'cl-test-class', style: { color: 'red' } },
      };
      expect(applyTheme(theme, appearance)).toStrictEqual({
        theme,
        options: defaultAppearance.options,
        elements: {
          ...fullTheme,
          alert__warning: {
            className: 'cl-test-class cl-test-1',
            descriptor: 'test',
            style: { color: 'red' },
          },
        },
      });
    });
  });
}
