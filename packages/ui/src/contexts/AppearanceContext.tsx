import { createContextAndHook, useDeepEqualMemo } from '@clerk/shared/react';
import type { Appearance, Elements, Layout } from '@clerk/types';
import React from 'react';

export type ParsedElements = Elements[];
export type ParsedLayout = Required<Layout>;

export type AppearanceCascade = {
  globalAppearance?: Appearance;
  appearance?: Appearance;
};

export type ParsedAppearance = {
  layout: ParsedLayout;
};

type AppearanceContextValue = {
  appearance?: Appearance;
  globalAppearance?: Appearance;
  parsedAppearance: ParsedAppearance;
};

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
    layout: { ...defaultAppearance.layout, ...props.globalAppearance?.layout, ...props.appearance?.layout },
  };

  return appearance;
}

const [AppearanceContext, useAppearance] = createContextAndHook<AppearanceContextValue>('AppearanceContext');

type AppearanceProviderProps = React.PropsWithChildren<AppearanceCascade>;

const AppearanceProvider = (props: AppearanceProviderProps) => {
  const ctxValue = useDeepEqualMemo(() => {
    const parsedAppearance = parseAppearance(props);

    return { value: { appearance: props.appearance, globalAppearance: props.globalAppearance, parsedAppearance } };
  }, [props.appearance, props.globalAppearance]);

  return <AppearanceContext.Provider value={ctxValue}>{props.children}</AppearanceContext.Provider>;
};

export { AppearanceProvider, useAppearance };
