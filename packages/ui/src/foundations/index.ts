import { createInternalTheme } from './createInternalTheme';
import type { InternalTheme, InternalThemeFoundations } from './defaultFoundations';
import { defaultInternalThemeFoundations } from './defaultFoundations';

const defaultInternalTheme = createInternalTheme(defaultInternalThemeFoundations);

export { neutralAlpha, whiteAlpha } from './colors';
export { defaultInternalThemeFoundations, defaultInternalTheme, createInternalTheme };
export type { InternalTheme, InternalThemeFoundations };
