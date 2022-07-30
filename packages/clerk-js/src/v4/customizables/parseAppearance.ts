import { Appearance, DeepPartial, Elements, Layout, Theme } from '@clerk/types';
import { BaseTheme, BaseThemeTaggedType } from '@clerk/types/src';

import { createInternalTheme, defaultInternalTheme } from '../foundations';
import { InternalTheme } from '../styledSystem';
import { fastDeepMergeAndReplace } from '../utils';
import {
  createColorScales,
  createFonts,
  createFontSizeScale,
  createFontWeightScale,
  createRadiiUnits,
  createSpaceScale,
  createThemeOptions,
} from './parseVariables';

export type ParsedElements = Elements[];
export type ParsedInternalTheme = InternalTheme;
export type ParsedLayout = Required<Layout>;

export type AppearanceCascade = {
  globalAppearance?: Appearance;
  appearance?: Appearance;
  appearanceKey: keyof Pick<Appearance, 'signIn' | 'signUp' | 'userProfile' | 'userButton'>;
};

export type ParsedAppearance = {
  parsedElements: ParsedElements;
  parsedInternalTheme: ParsedInternalTheme;
  parsedLayout: ParsedLayout;
};

const defaultLayout: ParsedLayout = {
  logoPlacement: 'inside',
  socialButtonsPlacement: 'top',
  socialButtonsVariant: 'auto',
  logoImageUrl: '',
};

/**
 * Parses the public appearance object.
 * It splits the resulting styles into 2 objects: parsedElements, parsedInternalTheme
 * parsedElements is used by the makeCustomizables HOC to handle per-element styling
 * parsedInternalTheme is used by FlowCard/InternalThemeProvider for generic theming
 * Both are injected by the AppearanceContext
 */
export const parseAppearance = (cascade: AppearanceCascade): ParsedAppearance => {
  const { globalAppearance, appearance: componentAppearance, appearanceKey } = cascade;

  const appearanceList: Appearance[] = [];
  [globalAppearance, globalAppearance?.[appearanceKey], componentAppearance].forEach(a => expand(a, appearanceList));

  const parsedInternalTheme = parseVariables(appearanceList);
  const parsedLayout = parseLayout(appearanceList);
  const parsedElements = parseElements(
    appearanceList.map(a => {
      if (!a.elements || typeof a.elements !== 'function') {
        return a;
      }
      const res = { ...a };
      res.elements = a.elements({ theme: parsedInternalTheme });
      return res;
    }),
  );
  return { parsedElements, parsedInternalTheme, parsedLayout };
};

const expand = (theme: Theme | undefined, cascade: any[]) => {
  if (!theme) {
    return;
  }
  (Array.isArray(theme.baseTheme) ? theme.baseTheme : [theme.baseTheme]).forEach(baseTheme =>
    expand(baseTheme as Theme, cascade),
  );
  cascade.push(theme);
};

const parseElements = (appearances: Appearance[]) => {
  return appearances.map(appearance => ({ ...appearance?.elements }));
};

const parseLayout = (appearanceList: Appearance[]) => {
  return { ...defaultLayout, ...appearanceList.reduce((acc, appearance) => ({ ...acc, ...appearance.layout }), {}) };
};

const parseVariables = (appearances: Appearance[]) => {
  const res = {} as DeepPartial<InternalTheme>;
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
  const colors = { ...createColorScales(theme) };
  const radii = { ...createRadiiUnits(theme) };
  const space = { ...createSpaceScale(theme) };
  const fontSizes = { ...createFontSizeScale(theme) };
  const fontWeights = { ...createFontWeightScale(theme) };
  const fonts = { ...createFonts(theme) };
  const options = { ...createThemeOptions(theme) };
  return createInternalTheme({ colors, radii, space, fontSizes, fontWeights, fonts, options } as any);
};
