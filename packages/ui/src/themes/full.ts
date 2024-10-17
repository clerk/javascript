import { visualStyle as alertVisualStyle } from '~/primitives/alert';
import { visualStyle as buttonVisualStyle } from '~/primitives/button';
import { visualStyle as cardVisualStyle } from '~/primitives/card';
import { visualStyle as separatorVisualStyle } from '~/primitives/separator';
import { visualStyle as spinnerVisualStyle } from '~/primitives/spinner';

import { buildTheme, mergeTheme } from './buildTheme';
import { layoutTheme } from './layout';

const visualTheme = buildTheme({
  ...alertVisualStyle,
  ...buttonVisualStyle,
  ...cardVisualStyle,
  ...separatorVisualStyle,
  ...spinnerVisualStyle,
});
export const fullTheme = mergeTheme(layoutTheme, visualTheme);
