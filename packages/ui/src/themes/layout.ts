import { layoutStyle as connectionsLayoutStyle } from '~/common/connections';
import { layoutStyle as alertLayoutStyle } from '~/primitives/alert';
import { layoutStyle as buttonLayoutStyle } from '~/primitives/button';
import { layoutStyle as separatorLayoutStyle } from '~/primitives/separator';
import { layoutStyle as spinnerLayoutStyle } from '~/primitives/spinner';

import { buildTheme } from './buildTheme';

export const layoutTheme = buildTheme({
  ...alertLayoutStyle,
  ...buttonLayoutStyle,
  ...connectionsLayoutStyle,
  ...separatorLayoutStyle,
  ...spinnerLayoutStyle,
});
