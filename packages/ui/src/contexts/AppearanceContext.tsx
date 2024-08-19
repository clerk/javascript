import { createContextAndHook, useDeepEqualMemo } from '@clerk/shared/react';
import type { Appearance as CurrentAppearance, Layout } from '@clerk/types';
import React from 'react';

export type ParsedElements = Record<string, { className: string; style: React.CSSProperties }>;
export type ParsedLayout = Required<Layout>;

type ElementsAppearanceConfig = string | (React.CSSProperties & { className?: string });

export type Appearance = Omit<CurrentAppearance, 'elements'> & {
  elements?: Record<string, ElementsAppearanceConfig>;
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
      if (typeof config === 'string') {
        mergedElements[element].className += ` ${config}`;
      } else {
        const { className, ...style } = config;
        if (className) {
          mergedElements[element].className += ` ${className}`;
        }
        mergedElements[element].style = { ...mergedElements[element].style, ...style };
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
    elements: {
      formButtonPrimary: {
        className: 'debug',
        style: {},
      },
    },
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
