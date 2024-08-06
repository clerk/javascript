import type { Appearance, DeepPartial, Elements, Layout, Theme } from '@clerk/types';

import { createInternalTheme, defaultInternalTheme } from '../foundations';
import { polishedAppearance } from '../polishedAppearance';
import type { InternalTheme } from '../styledSystem';
import { fastDeepMergeAndReplace } from '../utils';
import {
  createColorScales,
  createFonts,
  createFontSizeScale,
  createFontWeightScale,
  createRadiiUnits,
  createSpaceScale,
} from './parseVariables';

export type ParsedElements = Elements[];
export type ParsedInternalTheme = InternalTheme;
export type ParsedLayout = Required<Layout>;

type PublicAppearanceTopLevelKey = keyof Omit<Appearance, 'baseTheme' | 'elements' | 'layout' | 'variables'>;

export type AppearanceCascade = {
  globalAppearance?: Appearance;
  appearance?: Appearance;
  appearanceKey: PublicAppearanceTopLevelKey | 'impersonationFab';
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
  logoLinkUrl: '',
  showOptionalFields: true,
  helpPageUrl: '',
  privacyPageUrl: '',
  termsPageUrl: '',
  shimmer: true,
  animations: true,
  unsafe_disableDevelopmentModeWarnings: false,
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
  [globalAppearance, globalAppearance?.[appearanceKey as PublicAppearanceTopLevelKey], componentAppearance].forEach(a =>
    expand(a, appearanceList),
  );

  const parsedInternalTheme = parseVariables(appearanceList);
  const parsedLayout = parseLayout(appearanceList);

  if (
    !appearanceList.find(a => {
      //@ts-expect-error not public api
      return !!a.simpleStyles;
    })
  ) {
    appearanceList.unshift(polishedAppearance);
  }

  const parsedElements = parseElements(
    appearanceList.map(appearance => {
      if (!appearance.elements || typeof appearance.elements !== 'function') {
        return appearance;
      }
      const res = { ...appearance };
      res.elements = appearance.elements({ theme: parsedInternalTheme });
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
  return createInternalTheme({ colors, radii, space, fontSizes, fontWeights, fonts } as any);
};
