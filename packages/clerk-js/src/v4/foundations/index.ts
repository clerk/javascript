import { createInternalTheme } from './createInternalTheme';
import { defaultInternalThemeFoundations, InternalTheme, InternalThemeFoundations } from './defaultFoundations';

const defaultInternalTheme = createInternalTheme(defaultInternalThemeFoundations);

export { blackAlpha, whiteAlpha } from './colors';
export { defaultInternalThemeFoundations, defaultInternalTheme, createInternalTheme };
export type { InternalTheme, InternalThemeFoundations };
