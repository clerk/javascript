import { layoutStyle as alertLayoutStyle } from '~/primitives/alert';
import { layoutStyle as buttonStyle } from '~/primitives/button';
import { layoutStyle as separatorStyle } from '~/primitives/separator';

import { buildTheme } from './buildTheme';

export const layoutTheme = buildTheme({ ...alertLayoutStyle, ...separatorStyle, ...buttonStyle });
