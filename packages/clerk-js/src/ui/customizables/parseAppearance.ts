import type { Appearance, CaptchaAppearanceOptions, DeepPartial, Elements, Layout, Theme } from '@clerk/shared/types';
import { fastDeepMergeAndReplace } from '@clerk/shared/utils';

import { baseTheme, getBaseTheme } from '../baseTheme';
import { createInternalTheme, defaultInternalTheme } from '../foundations';
import type { InternalTheme } from '../styledSystem';
import {
  createColorScales,
  createFonts,
  createFontSizeScale,
  createFontWeightScale,
  createRadiiUnits,
  createShadowsUnits,
  createSpaceScale,
} from './parseVariables';

export type ParsedElements = Elements[];
export type ParsedInternalTheme = InternalTheme;
export type ParsedLayout = Required<Layout>;
export type ParsedCaptcha = Required<CaptchaAppearanceOptions>;

type PublicAppearanceTopLevelKey = keyof Omit<
  Appearance,
  'baseTheme' | 'theme' | 'elements' | 'layout' | 'variables' | 'captcha' | 'cssLayerName'
>;

export type AppearanceCascade = {
  globalAppearance?: Appearance;
  appearance?: Appearance;
  appearanceKey: PublicAppearanceTopLevelKey | 'impersonationFab' | 'enableOrganizationsPrompt';
};

export type ParsedAppearance = {
  parsedElements: ParsedElements;
  parsedInternalTheme: ParsedInternalTheme;
  parsedLayout: ParsedLayout;
  parsedCaptcha: ParsedCaptcha;
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

const defaultCaptchaOptions: ParsedCaptcha = {
  theme: 'auto',
  size: 'normal',
  language: '',
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
  const parsedCaptcha = parseCaptcha(appearanceList);

  if (
    !appearanceList.find(a => {
      //@ts-expect-error not public api
      return !!a.simpleStyles;
    })
  ) {
    appearanceList.unshift(baseTheme);
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
  return { parsedElements, parsedInternalTheme, parsedLayout, parsedCaptcha };
};

const expand = (theme: Theme | undefined, cascade: any[]) => {
  if (!theme) {
    return;
  }

  // Use new 'theme' property if available, otherwise fall back to deprecated 'baseTheme'
  const themeProperty = theme.theme !== undefined ? theme.theme : theme.baseTheme;

  if (themeProperty !== undefined) {
    (Array.isArray(themeProperty) ? themeProperty : [themeProperty]).forEach(baseTheme => {
      if (typeof baseTheme === 'string') {
        expand(getBaseTheme(baseTheme), cascade);
      } else {
        expand(baseTheme as Theme, cascade);
      }
    });
  }

  cascade.push(theme);
};

const parseElements = (appearances: Appearance[]) => {
  return appearances.map(appearance => ({ ...appearance?.elements }));
};

const parseLayout = (appearanceList: Appearance[]) => {
  return { ...defaultLayout, ...appearanceList.reduce((acc, appearance) => ({ ...acc, ...appearance.layout }), {}) };
};

const parseCaptcha = (appearanceList: Appearance[]) => {
  return {
    ...defaultCaptchaOptions,
    ...appearanceList.reduce((acc, appearance) => {
      if (appearance.captcha) {
        const { theme: captchaTheme, size, language } = appearance.captcha;
        return {
          ...acc,
          ...(captchaTheme && { theme: captchaTheme }),
          ...(size && { size }),
          ...(language && { language }),
        };
      }
      return acc;
    }, {} as Partial<CaptchaAppearanceOptions>),
  };
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
  const shadows = { ...createShadowsUnits(theme) };
  return createInternalTheme({ colors, radii, space, fontSizes, fontWeights, fonts, shadows } as any);
};
