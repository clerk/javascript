import { createInternalTheme } from './createInternalTheme';
import {
  defaultFoundationsCopy,
  defaultInternalThemeFoundations,
  InternalTheme,
  InternalThemeFoundations,
} from './defaultFoundations';

const defaultInternalTheme = createInternalTheme(defaultInternalThemeFoundations);

export { defaultInternalThemeFoundations, defaultInternalTheme, createInternalTheme, defaultFoundationsCopy };
export type { InternalTheme, InternalThemeFoundations };
