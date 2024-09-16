import { layoutStyle as alertLayoutStyle } from '~/primitives/alert';
import { layoutStyle as separatorStyle } from '~/primitives/separator';

import { buildTheme } from './buildTheme';

export const layoutTheme = buildTheme({ ...alertLayoutStyle, ...separatorStyle });
