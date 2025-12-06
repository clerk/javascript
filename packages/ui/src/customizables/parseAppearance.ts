import type { DeepPartial } from '@clerk/shared/types';
import { fastDeepMergeAndReplace } from '@clerk/shared/utils';

import { baseTheme, getBaseTheme } from '../baseTheme';
import { createInternalTheme, defaultInternalTheme } from '../foundations';
import type { Appearance, CaptchaAppearanceOptions, Elements, Options, Theme } from '../internal/appearance';
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
export type ParsedOptions = Required<Options>;
export type ParsedCaptcha = Required<CaptchaAppearanceOptions>;

type PublicAppearanceTopLevelKey = keyof Omit<
  Appearance,
  'theme' | 'elements' | 'options' | 'variables' | 'captcha' | 'cssLayerName'
>;

export type AppearanceCascade = {
  globalAppearance?: Appearance;
  appearance?: Appearance;
  appearanceKey: PublicAppearanceTopLevelKey | 'impersonationFab' | 'enableOrganizationsPrompt';
};

export type ParsedAppearance = {
  parsedElements: ParsedElements;
  parsedInternalTheme: ParsedInternalTheme;
  parsedOptions: ParsedOptions;
  parsedCaptcha: ParsedCaptcha;
};

const defaultOptions: ParsedOptions = {
  logoPlacement: 'inside',
  socialButtonsPlacement: 'top',
  socialButtonsVariant: 'auto',
  logoImageUrl: '',
  logoLinkUrl: '',
  showOptionalFields: false,
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
  console.log('[parseAppearance] globalAppearance', JSON.stringify(globalAppearance));
  console.log('[parseAppearance] componentAppearance', JSON.stringify(componentAppearance));
  console.log('[parseAppearance] appearanceKey', appearanceKey);
  const appearanceList: Appearance[] = [];
  [globalAppearance, globalAppearance?.[appearanceKey as PublicAppearanceTopLevelKey], componentAppearance].forEach(a =>
    expand(a, appearanceList),
  );

  console.log('[parseAppearance] appearanceList length', appearanceList.length);
  console.log(
    '[parseAppearance] appearanceList options',
    appearanceList.map(a => JSON.stringify(a?.options)),
  );

  const parsedInternalTheme = parseVariables(appearanceList);
  const parsedOptions = parseOptions(appearanceList);
  const parsedCaptcha = parseCaptcha(appearanceList);

  console.log('[parseAppearance] parsedOptions', JSON.stringify(parsedOptions));

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
  return { parsedElements, parsedInternalTheme, parsedOptions, parsedCaptcha };
};

const expand = (theme: Theme | undefined, cascade: any[]) => {
  if (!theme) {
    return;
  }

  const themeProperty = theme.theme;

  if (themeProperty !== undefined) {
    (Array.isArray(themeProperty) ? themeProperty : [themeProperty]).forEach(t => {
      if (typeof t === 'string') {
        expand(getBaseTheme(t), cascade);
      } else {
        expand(t as Theme, cascade);
      }
    });
  }

  cascade.push(theme);
};

const parseElements = (appearances: Appearance[]) => {
  return appearances.map(appearance => ({ ...appearance?.elements }));
};

const parseOptions = (appearanceList: Appearance[]) => {
  return { ...defaultOptions, ...appearanceList.reduce((acc, appearance) => ({ ...acc, ...appearance.options }), {}) };
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
