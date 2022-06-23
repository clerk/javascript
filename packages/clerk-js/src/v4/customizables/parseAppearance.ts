import { Appearance, DeepPartial, Elements, Options, Theme } from '@clerk/types';

import { createInternalTheme, defaultInternalTheme } from '../foundations';
import { InternalTheme } from '../styledSystem';
import { fastDeepMergeAndReplace } from '../utils';
import { colorOptionTo500Scale, colorOptionToHslaScale } from './colorOptionToHslaScale';

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
  return createInternalTheme({ colors: createColorScales(theme) } as any);
};

const createColorScales = (theme: Theme) => {
  return {
    ...colorOptionToHslaScale(theme?.variables?.colorPrimary, 'primary'),
    ...colorOptionToHslaScale(theme?.variables?.colorDanger, 'danger'),
    ...colorOptionToHslaScale(theme?.variables?.colorSuccess, 'success'),
    ...colorOptionToHslaScale(theme?.variables?.colorWarning, 'warning'),
    ...colorOptionToHslaScale(theme?.variables?.colorText, 'text'),
    ...colorOptionTo500Scale(theme?.variables?.colorInputText, 'inputText'),
    ...colorOptionTo500Scale(theme?.variables?.colorBackground, 'background'),
    ...colorOptionTo500Scale(theme?.variables?.colorInputBackground, 'inputBackground'),
  };
};
