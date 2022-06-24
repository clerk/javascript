import { Appearance, DeepPartial, Elements, Options, Theme } from '@clerk/types';

import { blackAlpha, createInternalTheme, defaultInternalTheme, whiteAlpha } from '../foundations';
import { InternalTheme } from '../styledSystem';
import { colors, fastDeepMergeAndReplace, removeUndefinedProps } from '../utils';
import { colorOptionToHslaScale } from './colorOptionToHslaScale';

export type ParsedElements = Elements[];
export type ParsedInternalTheme = InternalTheme;
export type ParsedOptions = Required<Options>;

export type ParsedAppearance = {
  parsedElements: ParsedElements;
  parsedInternalTheme: ParsedInternalTheme;
  parsedOptions: ParsedOptions;
};

const defaultOptions: ParsedOptions = {
  darkMode: false,
  logoPlacement: 'inside',
  socialButtonsPlacement: 'top',
  socialButtonsVariant: 'auto',
};

/**
 * Parses the public appearance object.
 * It splits the resulting styles into 2 objects: parsedElements, parsedInternalTheme
 * parsedElements is used by the makeCustomizables HOC to handle per-element styling
 * parsedInternalTheme is used by FlowCard/InternalThemeProvider for generic theming
 * Both are injected by the AppearanceContext
 */
export const parseAppearance = (appearanceObjects: Array<Appearance | undefined> = []): ParsedAppearance => {
  const appearanceList = appearanceObjects.filter(s => !!s) as Appearance[];
  const parsedInternalTheme = parseVariables(appearanceList);
  const parsedElements = parseElements(appearanceList);
  const parsedOptions = parseOptions(appearanceList);
  return { parsedElements, parsedInternalTheme, parsedOptions };
};

const parseElements = (appearances: Appearance[]) => {
  return appearances.map(appearance => ({ ...appearance?.elements }));
};

const parseOptions = (appearanceList: Appearance[]) => {
  return { ...defaultOptions, ...appearanceList.reduce((acc, appearance) => ({ ...acc, ...appearance.options }), {}) };
};

const parseVariables = (appearances: Appearance[]) => {
  const res = {};
  fastDeepMergeAndReplace({ ...defaultInternalTheme }, res);
  appearances.forEach(appearance => {
    fastDeepMergeAndReplace(createInternalThemeFromVariables(appearance), res);
  });
  return res as ParsedInternalTheme;
};

const createInternalThemeFromVariables = (theme: Theme | undefined): DeepPartial<InternalTheme> => {
  if (!theme) {
    return {};
  }
  return createInternalTheme({
    colors: {
      ...createColorScales(theme),
      ...reverseAlphaScalesIfNeeded(theme),
    },
  } as any);
};

const createColorScales = (theme: Theme) => {
  const variables = theme.variables || {};
  return removeUndefinedProps({
    ...colorOptionToHslaScale(variables.colorPrimary, 'primary'),
    ...colorOptionToHslaScale(variables.colorDanger, 'danger'),
    ...colorOptionToHslaScale(variables.colorSuccess, 'success'),
    ...colorOptionToHslaScale(variables.colorWarning, 'warning'),
    colorText: toHSLA(variables.colorText),
    colorTextOnPrimaryBackground: toHSLA(variables.colorTextOnPrimaryBackground),
    colorTextSecondary: toHSLA(variables.colorTextSecondary) || colors.makeTransparent(variables.colorText, 0.35),
    colorInputText: toHSLA(variables.colorInputText),
    colorBackground: toHSLA(variables.colorBackground),
    colorInputBackground: toHSLA(variables.colorInputBackground),
  });
};

const reverseAlphaScalesIfNeeded = (theme: Theme) => {
  const { alphaShadesMode = 'dark' } = theme.variables || {};
  if (alphaShadesMode === 'dark') {
    return;
  }

  return Object.fromEntries([
    ...Object.entries(whiteAlpha).map(([k, v]) => [k.replace('white', 'black'), v]),
    ...Object.entries(blackAlpha).map(([k, v]) => [k.replace('black', 'white'), v]),
  ]);
};

const toHSLA = (str: string | undefined) => {
  return str ? colors.toHslaString(str) : undefined;
};
