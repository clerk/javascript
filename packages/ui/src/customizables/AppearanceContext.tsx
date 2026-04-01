import { createContextAndHook, useDeepEqualMemo } from '@clerk/shared/react';
import React from 'react';

import { useWarnAboutCustomizationWithoutPinning } from '../hooks/useWarnAboutCustomizationWithoutPinning';
import type { AppearanceCascade, ParsedAppearance } from './parseAppearance';
import { parseAppearance } from './parseAppearance';

type AppearanceContextValue = ParsedAppearance;

const [AppearanceContext, useAppearance] = createContextAndHook<AppearanceContextValue>('AppearanceContext');

type AppearanceProviderProps = React.PropsWithChildren<AppearanceCascade>;

const AppearanceProvider = (props: AppearanceProviderProps) => {
  const ctxValue = useDeepEqualMemo(() => {
    const value = parseAppearance(props);
    return { value };
  }, [props.appearance, props.globalAppearance, props.appearanceKey]);

  // Check component-level appearance for structural CSS patterns
  useWarnAboutCustomizationWithoutPinning(props.appearance);

  return <AppearanceContext.Provider value={ctxValue}>{props.children}</AppearanceContext.Provider>;
};

export { AppearanceProvider, useAppearance };
