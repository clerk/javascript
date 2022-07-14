import { Appearance } from '@clerk/types';
import React from 'react';

import { createContextAndHook, useDeepEqualMemo } from '../utils';
import { parseAppearance, ParsedAppearance } from './parseAppearance';

type AppearanceContextValue = ParsedAppearance;

const [AppearanceContext, useAppearance] = createContextAndHook<AppearanceContextValue>('AppearanceContext');

type AppearanceProviderProps = React.PropsWithChildren<{
  appearance?: Appearance;
  globalAppearance?: Appearance;
  appearanceKey: keyof Pick<Appearance, 'signIn' | 'signUp' | 'userProfile' | 'userButton'>;
}>;

const AppearanceProvider = (props: AppearanceProviderProps) => {
  const ctxValue = useDeepEqualMemo(() => {
    const { appearance: componentAppearance, globalAppearance, appearanceKey } = props;

    const appearanceObjectCascade = [
      globalAppearance?.baseTheme as unknown as Appearance,
      globalAppearance,
      globalAppearance?.[appearanceKey],
      componentAppearance?.baseTheme as unknown as Appearance,
      componentAppearance,
    ];

    return { value: parseAppearance(appearanceObjectCascade) };
  }, [props.appearance, props.globalAppearance]);

  return <AppearanceContext.Provider value={ctxValue}>{props.children}</AppearanceContext.Provider>;
};

export { AppearanceProvider, useAppearance };
