import { DeepPartial, DisplayThemeJSON } from '@clerk/types';
import deepmerge from 'deepmerge';

import { injectCSSProperties } from './injectCSSProperties';
import { loadFonts } from './loadFonts';

/**
 * Merge theme retrieved from the network with user supplied theme options.
 *
 * loadFonts: Creates a <link> to Google Fonts for the selected font family.
 * injectCSSProperties: Creates a <style> with the required Clerk CSS variables and injects it on the top of the <head>.
 * @modifies DOM
 */
export function injectTheme(
  environmentThemeOptions: DisplayThemeJSON,
  userSuppliedThemeOptions: DeepPartial<DisplayThemeJSON>,
): void {
  /** deepmerge types can get a bit better ;) */
  const themeOptions = deepmerge(environmentThemeOptions, userSuppliedThemeOptions) as DisplayThemeJSON;

  loadFonts(themeOptions, userSuppliedThemeOptions);
  injectCSSProperties(themeOptions);
}
