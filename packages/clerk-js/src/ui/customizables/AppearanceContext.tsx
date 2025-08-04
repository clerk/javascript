import { createContextAndHook, useDeepEqualMemo } from '@clerk/shared/react';
import type { BaseTheme, BaseThemeTaggedType } from '@clerk/types';
// eslint-disable-next-line no-restricted-imports
import { css, Global } from '@emotion/react';
import React from 'react';

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

  // Extract global CSS from theme if it exists
  const getGlobalCss = (theme: BaseTheme | BaseTheme[] | undefined) => {
    if (
      typeof theme === 'object' &&
      !Array.isArray(theme) &&
      '__type' in theme &&
      theme.__type === 'prebuilt_appearance'
    ) {
      // Cast to the specific type that includes __internal_globalCss
      return (theme as BaseThemeTaggedType & { __internal_globalCss?: string }).__internal_globalCss;
    }
    return null;
  };

  const globalCss = getGlobalCss(props.appearance?.theme) || getGlobalCss(props.globalAppearance?.theme);

  return (
    <AppearanceContext.Provider value={ctxValue}>
      {globalCss && (
        <Global
          styles={css`
            ${globalCss}
          `}
        />
      )}
      {props.children}
    </AppearanceContext.Provider>
  );
};

export { AppearanceProvider, useAppearance };
