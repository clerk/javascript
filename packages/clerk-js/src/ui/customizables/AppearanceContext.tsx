import { createContextAndHook } from '@clerk/shared';
import React from 'react';

import { useDeepEqualMemo } from '../hooks';
import type { AppearanceCascade, ParsedAppearance } from './parseAppearance';
import { parseAppearance } from './parseAppearance';

type AppearanceContextValue = ParsedAppearance;

const [AppearanceContext, useAppearance] = createContextAndHook<AppearanceContextValue>('AppearanceContext');

type AppearanceProviderProps = React.PropsWithChildren<AppearanceCascade>;

const AppearanceProvider = (props: AppearanceProviderProps) => {
  const ctxValue = useDeepEqualMemo(() => {
    const value = parseAppearance(props);

    return { value };
  }, [props.appearance, props.globalAppearance]);

  return <AppearanceContext.Provider value={ctxValue}>{props.children}</AppearanceContext.Provider>;
};

export { AppearanceProvider, useAppearance };
