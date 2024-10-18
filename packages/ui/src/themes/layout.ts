import { layoutStyle as alertLayoutStyle } from '~/primitives/alert';
import { layoutStyle as buttonStyle } from '~/primitives/button';
import { layoutStyle as cardLayoutStyle } from '~/primitives/card';
import { layoutStyle as separatorStyle } from '~/primitives/separator';
import { layoutStyle as layoutSpinnerStyle } from '~/primitives/spinner';

import { buildTheme } from './buildTheme';

export const layoutTheme = buildTheme({
  ...alertLayoutStyle,
  ...buttonStyle,
  ...cardLayoutStyle,
  ...separatorStyle,
  ...layoutSpinnerStyle,
});
