import { Appearance, DeepPartial, Elements, Theme } from '@clerk/types';

import { createInternalTheme, defaultInternalTheme } from '../foundations';
import { InternalTheme } from '../styledSystem';
import { fastDeepMergeAndReplace } from '../utils';
import { colorOptionTo500Scale, colorOptionToHslaScale } from './colorOptionToHslaScale';

type ExpandForBaseAndComponents<T> = {
  base: T;
  signIn: T;
  signUp: T;
  userButton: T;
  userProfile: T;
};

export type ParsedElements = ExpandForBaseAndComponents<Elements>;
export type ParsedInternalTheme = ExpandForBaseAndComponents<Partial<InternalTheme>>;

export type ParsedAppearance = {
  parsedElements: ParsedElements;
  parsedInternalTheme: ParsedInternalTheme;
};

/**
 * Parses the public appearance object.
 * It splits the resulting styles into 2 objects: parsedElements, parsedInternalTheme
 * parsedElements is used by the makeCustomizables HOC to handle per-element styling
 * parsedInternalTheme is used by FlowCard/InternalThemeProvider for generic theming
 * Both are injected by the AppearanceContext
 */
export const parseAppearance = (appearance: Appearance | undefined = {}): ParsedAppearance => {
  const parsedTheme = parseVariables(appearance);
  const parsedElements = parseElements(appearance);
  return { parsedElements, parsedInternalTheme: parsedTheme };
};

const parseElements = (appearance: Appearance | undefined = {}): ParsedElements => {
  return {
    base: { ...appearance.elements },
    signIn: { ...appearance.signIn?.elements },
    signUp: { ...appearance.signUp?.elements },
    userButton: { ...appearance?.userButton?.elements },
    userProfile: { ...appearance?.userProfile?.elements },
  };
};

// TODO: (Perf) Do not iterate over all values of foundations,
//  only those that can be customised by the user
const parseVariables = (appearance: Appearance): ParsedInternalTheme => {
  const allThemes = { base: {}, signIn: {}, signUp: {}, userProfile: {}, userButton: {} };
  // merge default internal theme and base variables theme into .allThemesbase
  fastDeepMergeAndReplace({ ...defaultInternalTheme }, allThemes.base);
  fastDeepMergeAndReplace(createInternalThemeFromVariables(appearance), allThemes.base);
  // copy allThemes.base into allThemes.[flow] to be used as the base theme
  fastDeepMergeAndReplace(allThemes.base, allThemes.signIn);
  fastDeepMergeAndReplace(allThemes.base, allThemes.signUp);
  fastDeepMergeAndReplace(allThemes.base, allThemes.userButton);
  fastDeepMergeAndReplace(allThemes.base, allThemes.userProfile);
  // apply specific overrides from appearance[flow].variables config
  fastDeepMergeAndReplace(createInternalThemeFromVariables(appearance.signIn), allThemes.signIn);
  fastDeepMergeAndReplace(createInternalThemeFromVariables(appearance.signUp), allThemes.signUp);
  fastDeepMergeAndReplace(createInternalThemeFromVariables(appearance.userButton), allThemes.userButton);
  fastDeepMergeAndReplace(createInternalThemeFromVariables(appearance.userProfile), allThemes.userProfile);
  return allThemes;
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
