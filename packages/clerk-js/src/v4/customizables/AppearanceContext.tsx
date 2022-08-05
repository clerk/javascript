import React from 'react';

import { createContextAndHook, useDeepEqualMemo } from '../utils';
import { AppearanceCascade, parseAppearance, ParsedAppearance } from './parseAppearance';

type AppearanceContextValue = ParsedAppearance;

const [AppearanceContext, useAppearance] = createContextAndHook<AppearanceContextValue>('AppearanceContext');

type AppearanceProviderProps = React.PropsWithChildren<AppearanceCascade>;

const AppearanceProvider = (props: AppearanceProviderProps) => {
  const ctxValue = useDeepEqualMemo(() => {
    const value = parseAppearance(props);
    injectIntoWindowDebug(props.appearanceKey, props, value);

    return { value };
  }, [props.appearance, props.globalAppearance]);

  return <AppearanceContext.Provider value={ctxValue}>{props.children}</AppearanceContext.Provider>;
};

const injectIntoWindowDebug = (key: any, cascade: any, parsedAppearance: any) => {
  if (typeof window !== 'undefined') {
    (window as any).__clerk_debug = {
      [`__${key}`]: {
        __appearanceCascade: cascade,
        __parsedAppearance: parsedAppearance,
      },
    };
  }
};

export { AppearanceProvider, useAppearance };
