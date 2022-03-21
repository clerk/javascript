import { DeepPartial, DisplayThemeJSON } from '@clerk/types';
import { fontLoader } from 'utils/customFont';

/**
 * In the case the client has overridden any fonts using CSS variables,
 * we need to make sure we don't call GFonts without reason.
 * Due to the class scoping of our definitions and the .cl-component element
 * not being present during render time, we create a fake one so that DOM can
 * apply CSS computed properties and we can reach them.
 *
 * Then we remove it.
 */
function queryClerkFontVariableDefinitions() {
  const tempElem = document.createElement('div');
  tempElem.classList.add('cl-component');
  document.body.appendChild(tempElem);

  const computedStyles = getComputedStyle(tempElem);
  const hasLocalCssVarForGeneralFontFamily = computedStyles.getPropertyValue('--clerk-font-family');
  const hasLocalCssVarForButtonFontFamily = computedStyles.getPropertyValue('--clerk-button-font-family');

  tempElem.remove();

  return {
    hasLocalCssVarForGeneralFontFamily,
    hasLocalCssVarForButtonFontFamily,
  };
}

export function loadFonts(theme: DisplayThemeJSON, userSuppliedThemeOptions: DeepPartial<DisplayThemeJSON>): void {
  /** Query the DOM about defined style variable & check user supplied theme prop */
  const { hasLocalCssVarForButtonFontFamily, hasLocalCssVarForGeneralFontFamily } = queryClerkFontVariableDefinitions();
  const hasLocalGeneralFont = userSuppliedThemeOptions.general?.font_family || hasLocalCssVarForGeneralFontFamily;
  const hasLocalButtonFont = userSuppliedThemeOptions.buttons?.font_family || hasLocalCssVarForButtonFontFamily;

  /** If there is no local font option passed in 'general' or '--clerk-font-family' */
  if (!hasLocalGeneralFont) {
    const [firstGeneralFont] = theme.general.font_family.split(',');
    fontLoader(firstGeneralFont);
  }

  /** If there is no local font option passed in 'buttons' or '--clerk-button-font-family' */
  if (!hasLocalButtonFont) {
    const [firstButtonFont] = theme.buttons.font_family.split(',');
    fontLoader(firstButtonFont, [theme.buttons.font_weight]);
  }
}
