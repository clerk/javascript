import { layoutStyle as alertLayoutStyle } from '~/primitives/alert';
import { layoutStyle as cardLayoutStyle } from '~/primitives/card';
import { layoutStyle as separatorStyle } from '~/primitives/separator';

import { buildTheme } from './buildTheme';

export const layoutTheme = buildTheme({ ...alertLayoutStyle, ...cardLayoutStyle, ...separatorStyle });
