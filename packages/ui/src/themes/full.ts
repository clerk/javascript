import { visualStyle as alertVisualStyle } from '~/primitives/alert';
import { buildTheme, mergeTheme } from './buildTheme';
import { layoutTheme } from './layout';

const visualTheme = buildTheme({ ...alertVisualStyle });
export const fullTheme = mergeTheme(layoutTheme, visualTheme);
