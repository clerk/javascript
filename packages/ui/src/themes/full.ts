import { visualStyle as alertVisualStyle } from '~/primitives/alert';
import { visualStyle as buttonVisualStyle } from '~/primitives/button';
import { visualStyle as separatorVisualStyle } from '~/primitives/separator';

import { buildTheme, mergeTheme } from './buildTheme';
import { layoutTheme } from './layout';

const visualTheme = buildTheme({ ...alertVisualStyle, ...separatorVisualStyle, ...buttonVisualStyle });
export const fullTheme = mergeTheme(layoutTheme, visualTheme);
