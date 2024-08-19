import { createContextAndHook, useDeepEqualMemo } from '@clerk/shared/react';
import type { Appearance, Elements, Layout } from '@clerk/types';
import React from 'react';

export type ParsedElements = Elements[];
export type ParsedLayout = Required<Layout>;

export type AppearanceCascade = {
  globalAppearance?: Appearance;
  appearance?: Appearance;
};

/**
 * The generated appearance calculated from defaults and user-provided values. This is the type used to access computed
 * appearance values, and as such will always have a value for a given key.
 */
export type ParsedAppearance = {
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
 * Given a `globalAppearance` and `appearance` value, calculate a resulting `ParsedAppearance` that factors in both
 * defaults and provided values.
 */
function parseAppearance(props: AppearanceCascade): ParsedAppearance {
  const defaultAppearance: ParsedAppearance = {
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
