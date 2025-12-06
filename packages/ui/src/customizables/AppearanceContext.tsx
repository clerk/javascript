import { createContextAndHook, useDeepEqualMemo } from '@clerk/shared/react';
import React from 'react';

import type { AppearanceCascade, ParsedAppearance } from './parseAppearance';
import { parseAppearance } from './parseAppearance';

type AppearanceContextValue = ParsedAppearance;

const [AppearanceContext, useAppearance] = createContextAndHook<AppearanceContextValue>('AppearanceContext');

type AppearanceProviderProps = React.PropsWithChildren<AppearanceCascade>;

const AppearanceProvider = (props: AppearanceProviderProps) => {
  console.log('[AppearanceProvider] rendering with props:', {
    globalAppearance: JSON.stringify(props.globalAppearance),
    appearance: JSON.stringify(props.appearance),
    appearanceKey: props.appearanceKey,
  });

  const ctxValue = useDeepEqualMemo(() => {
    console.log('[AppearanceProvider] useDeepEqualMemo factory called');
    const value = parseAppearance(props);
    console.log('[AppearanceProvider] parsed value.parsedLayout:', JSON.stringify(value.parsedLayout));
    return { value };
  }, [props.appearance, props.globalAppearance, props.appearanceKey]);

  console.log('[AppearanceProvider] ctxValue.value.parsedLayout:', JSON.stringify(ctxValue.value.parsedLayout));

  return <AppearanceContext.Provider value={ctxValue}>{props.children}</AppearanceContext.Provider>;
};

export { AppearanceProvider, useAppearance };
