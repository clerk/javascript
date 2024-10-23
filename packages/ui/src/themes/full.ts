import { visualStyle as connections } from '~/common/connections';
import { visualStyle as alert } from '~/primitives/alert';
import { visualStyle as button } from '~/primitives/button';
import { visualStyle as card } from '~/primitives/card';
import { visualStyle as separator } from '~/primitives/separator';
import { visualStyle as spinner } from '~/primitives/spinner';

import { buildTheme, mergeTheme } from './buildTheme';
import { layoutTheme } from './layout';

const visualTheme = buildTheme({
  ...alert,
  ...button,
  ...card,
  ...connections,
  ...separator,
  ...spinner,
});
export const fullTheme = mergeTheme(layoutTheme, visualTheme);
