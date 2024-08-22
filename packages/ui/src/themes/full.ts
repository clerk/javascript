import { mergeParsedElementsFragment } from '~/contexts/AppearanceContext';
import { visualStyle as alertVisualStyle } from '~/primitives/alert';
import { layoutTheme } from './layout';
import { buildTheme } from './buildTheme';

export const fullTheme = buildTheme(mergeParsedElementsFragment(layoutTheme, alertVisualStyle));
