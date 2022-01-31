import { DisplayThemeJSON } from '@clerk/types';
import {
  getButtonCustomCss,
  getFontCustomCss,
  getGenericCustomCss,
  getPrimaryColorVariations,
} from 'utils/customCss';

export function injectCSSProperties(theme: DisplayThemeJSON): void {
  const customCssStyles = [
    getPrimaryColorVariations,
    getFontCustomCss,
    getButtonCustomCss,
    getGenericCustomCss,
  ]
    .map(f => f(theme))
    .join('\n');

  const cssVar = document.createElement('style');
  cssVar.innerHTML = `.cl-component {
    ${customCssStyles}
  }`;

  /** Insertion is done on the top of the <head> to allow user CSS variable override without !important. */
  const head = document.head;
  head.insertBefore(cssVar, head.firstChild);
}
