import { Appearance } from '@clerk/types';
import React from 'react';

import { createContextAndHook, useDeepEqualMemo } from '../utils';
import { parseAppearance, ParsedAppearance } from './appearanceAdapter';

type AppearanceContextValue = ParsedAppearance;

const [AppearanceContext, useAppearance] = createContextAndHook<AppearanceContextValue>('AppearanceContext');

type AppearanceProviderProps = React.PropsWithChildren<{
  appearance: Appearance;
}>;

const AppearanceProvider = (props: AppearanceProviderProps) => {
  const ctxValue = useDeepEqualMemo(() => {
    return { value: parseAppearance(props.appearance) };
  }, [props.appearance]);

  return <AppearanceContext.Provider value={ctxValue}>{props.children}</AppearanceContext.Provider>;
};

export { AppearanceProvider, useAppearance };
