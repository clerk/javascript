import { createContextAndHook, useDeepEqualMemo } from '@clerk/shared/react';
import { css, Global } from '@emotion/react';
import React from 'react';

import { extractDarkModeInfo, generateCSSVariables } from './generateDarkModeStyles';
import type { AppearanceCascade, ParsedAppearance } from './parseAppearance';
import { parseAppearance } from './parseAppearance';

type AppearanceContextValue = ParsedAppearance;

const [AppearanceContext, useAppearance] = createContextAndHook<AppearanceContextValue>('AppearanceContext');

type AppearanceProviderProps = React.PropsWithChildren<AppearanceCascade>;

const AppearanceProvider = (props: AppearanceProviderProps) => {
  const ctxValue = useDeepEqualMemo(() => {
    const value = parseAppearance(props);
    return value;
  }, [props.appearance, props.globalAppearance]);

  // Generate dark mode CSS variables from themes
  const darkModeStyles = useDeepEqualMemo(() => {
    const { globalAppearance, appearance } = props;
    let cssVariables = '';

    // Check global appearance theme for dark mode support
    if (globalAppearance?.theme) {
      const themes = Array.isArray(globalAppearance.theme) ? globalAppearance.theme : [globalAppearance.theme];
      for (const theme of themes) {
        if (theme && typeof theme === 'object') {
          const { originalVariables, darkModeSelector, supportsDarkMode } = extractDarkModeInfo(theme);
          if (supportsDarkMode && originalVariables && darkModeSelector) {
            cssVariables += generateCSSVariables(originalVariables, darkModeSelector);
          }
        }
      }
    }

    // Check component-specific appearance theme for dark mode support
    if (appearance?.theme) {
      const themes = Array.isArray(appearance.theme) ? appearance.theme : [appearance.theme];
      for (const theme of themes) {
        if (theme && typeof theme === 'object') {
          const { originalVariables, darkModeSelector, supportsDarkMode } = extractDarkModeInfo(theme);
          if (supportsDarkMode && originalVariables && darkModeSelector) {
            cssVariables += generateCSSVariables(originalVariables, darkModeSelector);
          }
        }
      }
    }

    return cssVariables;
  }, [props.globalAppearance?.theme, props.appearance?.theme]);

  console.log(darkModeStyles);

  return (
    <>
      {darkModeStyles && (
        <Global
          styles={css`
            ${darkModeStyles}
          `}
        />
      )}
      <AppearanceContext.Provider value={ctxValue}>{props.children}</AppearanceContext.Provider>
    </>
  );
};

export { AppearanceProvider, useAppearance };
