import { Appearance, DeepPartial, Elements, Options, Theme } from '@clerk/types';

import { createInternalTheme, defaultInternalTheme } from '../foundations';
import { InternalTheme } from '../styledSystem';
import { fastDeepMergeAndReplace } from '../utils';
import { createColorScales, createRadiiUnits, reverseAlphaScalesIfNeeded } from './parseVariables';

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
    radii: { ...createRadiiUnits(theme) },
  } as any);
};
