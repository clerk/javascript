import { layoutStyle as alertLayoutStyle } from '~/primitives/alert';
import { layoutStyle as linkLayoutStyle } from '~/primitives/link';
import { layoutStyle as separatorStyle } from '~/primitives/separator';

import { buildTheme } from './buildTheme';

export const layoutTheme = buildTheme({ ...alertLayoutStyle, ...linkLayoutStyle, ...separatorStyle });
