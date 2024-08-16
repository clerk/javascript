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
   * The appearance value provided to the AppearanceProvider. Should be passed to children `AppearanceProvider`s as the
   * `globalAppearance` prop.
   *
   * Example:
   * ```tsx
   * function SignIn({ children }) {
   *   const { appearance } = useAppearance();
   *   return (<AppearanceProvider globalAppearance={appearance} appearance={{}}>{children}</AppearanceProvider>)
   * }
   * ```
   */
  appearance?: Appearance;

  // TODO: This can probably be removed
  globalAppearance?: Appearance;

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

const [AppearanceContext, useAppearance] = createContextAndHook<AppearanceContextValue>('AppearanceContext');

type AppearanceProviderProps = React.PropsWithChildren<AppearanceCascade>;

/**
 * Used to provide appearance values throughout an application. In typical usage, the entire application will be
 * wrapped in an `AppearanceProvider` to provide global configuration. Each top-level AIO component that accepts an
 * `appearance` prop will wrap its children in `AppearanceProvider`, and provide the `appearance` value from
 * `useAppearance` as `globalAppearance` (which ensures that global configuration is able to be accounted for as well
 * as component-level configuration). The provider handles the merging of attributes, and makes them available via the
 * `useAppearance` hook.
 */
const AppearanceProvider = (props: AppearanceProviderProps) => {
  const ctxValue = useDeepEqualMemo(() => {
    const parsedAppearance = parseAppearance(props);

    return { value: { appearance: props.appearance, globalAppearance: props.globalAppearance, parsedAppearance } };
  }, [props.appearance, props.globalAppearance]);

  return <AppearanceContext.Provider value={ctxValue}>{props.children}</AppearanceContext.Provider>;
};

export { AppearanceProvider, useAppearance };
