import { createContextAndHook, useDeepEqualMemo } from '@clerk/shared/react';
import React from 'react';

import type { AppearanceCascade, ParsedAppearance } from './parseAppearance';
import { parseAppearance } from './parseAppearance';

export type AppearanceContextValue = ParsedAppearance & {
  darkModeSelector?: string;
};

const [AppearanceContext, useAppearance] = createContextAndHook<AppearanceContextValue>('AppearanceContext');

type AppearanceProviderProps = React.PropsWithChildren<AppearanceCascade>;

const AppearanceProvider = (props: AppearanceProviderProps) => {
  // Extract darkModeSelector from appearance configuration for elements
  const darkModeSelector = props.appearance?.darkModeSelector || props.globalAppearance?.darkModeSelector;

  const ctxValue = useDeepEqualMemo(() => {
    const parsedAppearance = parseAppearance(props);
    return { value: { ...parsedAppearance, darkModeSelector } };
  }, [props.appearance, props.globalAppearance, darkModeSelector]);

  return <AppearanceContext.Provider value={ctxValue}>{props.children}</AppearanceContext.Provider>;
};

export { AppearanceProvider, useAppearance };
