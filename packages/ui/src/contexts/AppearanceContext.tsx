import { createContextAndHook, useDeepEqualMemo } from '@clerk/shared/react';
import type { Appearance as CurrentAppearance, Layout } from '@clerk/types';
import React from 'react';

import { fullTheme } from '~/themes';

/**
 * Union of all valid descriptors used throughout the components.
 */
export type DescriptorIdentifier = 'alert' | 'alert__error' | 'alert__warning' | 'alertRoot' | 'alertIcon';

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
export type ParsedLayout = Required<Layout>;

type ElementsAppearanceConfig = string | (React.CSSProperties & { className?: string });

export type Appearance = Omit<CurrentAppearance, 'elements' | 'baseTheme'> & {
  theme?: ParsedElements;
  elements?: Record<DescriptorIdentifier, ElementsAppearanceConfig>;
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
  layout: ParsedLayout;
};

type AppearanceContextValue = {
  /**
   * The calculated appearance value based on the provided `appearance` and `globalAppearance`.
   *
   * Example:
   * ```tsx
   * function Help() {
   *   const { layout } = useAppearance().parsedAppearance;
   *   return <p>{layout.helpPageUrl}</p>
   * }
   * ```
   */
  parsedAppearance: ParsedAppearance;
  themelessAppearance: Appearance | null;
  theme?: ParsedElements;
};

/**
 * Used to merge full themes with ParsedElementsFragments. Allows you to combine layoutStyle with multiple visualStyle
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
      if (typeof el === 'boolean') return acc;
      acc.className = [el.descriptor, acc.className, el.className].join(' ');
      acc.style = { ...acc.style, ...el.style };
      return acc;
    },
    { className: 'debug', style: {} },
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
    result = { ...a, ...b, className: [a.className, b.className].join(' ') };
  }

  if (!result) {
    throw new Error(`Unable to merge ElementsAppearanceConfigs: ${a} and ${b}`);
  }

  return result;
}

function mergeAppearance(a: Appearance | null | undefined, b: Appearance | null | undefined): Appearance | null {
  if (!a && !b) return null;
  if (!a) return b!;
  if (!b) return a!;

  const result = { ...a, theme: b.theme, layout: { ...a.layout, ...b.layout } };

  if (!result.elements && b.elements) {
    result.elements = { ...b.elements };
  } else if (result.elements && b.elements) {
    Object.entries(b.elements).forEach(([element, config]) => {
      const el = element as DescriptorIdentifier;
      if (el in result.elements!) {
        result.elements![el] = mergeElementsAppearanceConfig(result.elements![el], config);
      } else {
        result.elements![el] = config;
      }
    });
  }

  return result;
}

function applyTheme(theme: ParsedElements | undefined, appearance: Appearance | null): ParsedAppearance {
  const baseTheme = theme ?? fullTheme;
  if (!appearance) return { theme: baseTheme, elements: baseTheme, layout: defaultAppearance.layout };

  const result = {
    theme: baseTheme,
    elements: { ...baseTheme },
    layout: { ...defaultAppearance.layout, ...appearance.layout },
  };

  if (appearance.elements) {
    Object.entries(appearance.elements).forEach(([element, config]) => {
      const el = element as DescriptorIdentifier;
      if (el in appearance.elements!) {
        if (typeof config === 'string') {
          result.elements[el].className = [result.elements[el].className, config].join(' ');
        } else {
          const { className, ...style } = config;
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

function mergeAppearenceElementsAndParsedAppearanceElements(
  defaultAppearance: ParsedAppearance,
  parsedAppearance?: ParsedAppearance,
  appearance?: Appearance,
): ParsedAppearance['elements'] {
  const defaultElements = defaultAppearance.elements;
  const parsedAppearanceElements = parsedAppearance?.elements;
  const appearanceElements = appearance?.elements;

  let mergedElements = { ...defaultElements };

  if (parsedAppearanceElements) {
    // If parsedAppearance is provided, it has already factored in defaultAppearance, so we can simply overwrite.
    mergedElements = { ...parsedAppearanceElements };
  }

  if (appearanceElements) {
    Object.entries(appearanceElements).forEach(([element, config]) => {
      const el = element as DescriptorIdentifier;
      if (typeof config === 'string') {
        mergedElements[el].className += [mergedElements[el].className, config].join(' ');
      } else {
        const { className, ...style } = config;
        if (className) {
          mergedElements[el].className = [mergedElements[el].className, className].join(' ');
        }
        mergedElements[el].style = {
          ...mergedElements[el].style,
          ...style,
        };
      }
    });
  }

  return mergedElements;
}

const defaultAppearance: ParsedAppearance = {
  theme: fullTheme,
  elements: fullTheme,
  layout: {
    logoPlacement: 'inside',
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

/**
 * Given a `globalAppearance` and `appearance` value, calculate a resulting `ParsedAppearance` that factors in both
 * defaults and provided values.
 */
function parseAppearance(
  props: AppearanceCascade,
  theme: ParsedAppearance | undefined = defaultAppearance,
): ParsedAppearance {
  const appearance = {
    ...theme,
    // This is a plain object, so we can use spread operations to override values in order of priority.
    layout: { ...theme.layout, ...props.globalAppearance?.layout, ...props.appearance?.layout },
    // The `elements` prop is more complicated, so we use a dedicated function to handle that logic
    elements: mergeAppearenceElementsAndParsedAppearanceElements(theme, props.globalAppearance, props.appearance),
  };

  return appearance;
}

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

  describe('mergeElementsAppearanceConfig', () => {
    it('merges two strings', () => {
      const a = 'class-one';
      const b = 'class-two';
      expect(mergeElementsAppearanceConfig(a, b)).toBe('class-one class-two');
    });

    it('merges a string and an object', () => {
      const a = 'class-one';
      const b = { className: 'class-two' };
      expect(mergeElementsAppearanceConfig(a, b)).toStrictEqual({ className: 'class-two class-one' });
    });

    it('merges an object and a string', () => {
      const a = { className: 'class-one' };
      const b = 'class-two';
      expect(mergeElementsAppearanceConfig(a, b)).toStrictEqual({ className: 'class-one class-two' });
    });

    it('merges two objects', () => {
      const a = { className: 'class-one' };
      const b = { className: 'class-two' };
      expect(mergeElementsAppearanceConfig(a, b)).toStrictEqual({ className: 'class-one class-two' });
    });

    it('merges a string and an object with style', () => {
      const a = 'class-one';
      const b = { className: 'class-two', backgroundColor: 'tomato' };
      expect(mergeElementsAppearanceConfig(a, b)).toStrictEqual({
        className: 'class-two class-one',
        backgroundColor: 'tomato',
      });
    });

    it('merges two objects with styles', () => {
      const a = { className: 'class-one', color: 'red' };
      const b = { className: 'class-two', backgroundColor: 'tomato' };
      expect(mergeElementsAppearanceConfig(a, b)).toStrictEqual({
        className: 'class-one class-two',
        color: 'red',
        backgroundColor: 'tomato',
      });
    });
  });
}
