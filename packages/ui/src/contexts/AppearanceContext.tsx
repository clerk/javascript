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
 * A full theme, minus generated descriptors.
 */
export type PartialParsedElements = Record<DescriptorIdentifier, Omit<ParsedDescriptor, 'descriptor'>>;

/**
 * A full theme, complete with descriptors. This is the value returned from useAppearance().parsedAppearance, and is
 * the main type interacted with within components.
 */
export type ParsedElements = Record<DescriptorIdentifier, ParsedDescriptor>;
export type ParsedLayout = Required<Layout>;

type ElementsAppearanceConfig = string | (React.CSSProperties & { className?: string });

export type Appearance = Omit<CurrentAppearance, 'elements'> & {
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

/**
 * Given a `globalAppearance` and `appearance` value, calculate a resulting `ParsedAppearance` that factors in both
 * defaults and provided values.
 */
function parseAppearance(props: AppearanceCascade): ParsedAppearance {
  const defaultAppearance: ParsedAppearance = {
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

  const appearance = {
    ...defaultAppearance,
    // This is a plain object, so we can use spread operations to override values in order of priority.
    layout: { ...defaultAppearance.layout, ...props.globalAppearance?.layout, ...props.appearance?.layout },
    // The `elements` prop is more complicated, so we use a dedicated function to handle that logic
    elements: mergeAppearenceElementsAndParsedAppearanceElements(
      defaultAppearance,
      props.globalAppearance,
      props.appearance,
    ),
  };

  return appearance;
}

const [AppearanceContext, useAppearance, usePartialAppearance] =
  createContextAndHook<AppearanceContextValue>('AppearanceContext');

type AppearanceProviderProps = React.PropsWithChildren<{ appearance?: Appearance }>;

/**
 * Used to provide appearance values throughout an application. In typical usage, the entire application will be
 * wrapped in an `AppearanceProvider` to provide global configuration. Each top-level AIO component that accepts an
 * `appearance` prop will wrap its children in `AppearanceProvider`. The provider handles the merging of attributes,
 * and makes them available via the `useAppearance` hook.
 */
const AppearanceProvider = (props: AppearanceProviderProps) => {
  // Access the parsedAppearance of the parent context provider. `undefined` if this is the top-most
  // AppearanceProvider.
  const { parsedAppearance: globalAppearance } = usePartialAppearance();

  const ctxValue = useDeepEqualMemo(() => {
    const parsedAppearance = parseAppearance({
      appearance: props.appearance,
      globalAppearance: globalAppearance,
    });

    return { value: { parsedAppearance } };
  }, [props.appearance, globalAppearance]);

  return <AppearanceContext.Provider value={ctxValue}>{props.children}</AppearanceContext.Provider>;
};

export { AppearanceProvider, useAppearance };
