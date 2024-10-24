import { layoutStyle as connections } from '~/common/connections';
import { layoutStyle as alert } from '~/primitives/alert';
import { layoutStyle as button } from '~/primitives/button';
import { layoutStyle as card } from '~/primitives/card';
import { layoutStyle as field } from '~/primitives/field';
import { layoutStyle as separator } from '~/primitives/separator';
import { layoutStyle as spinner } from '~/primitives/spinner';

import { buildTheme } from './buildTheme';

export const layoutTheme = buildTheme({
  ...alert,
  ...button,
  ...card,
  ...connections,
  ...field,
  ...separator,
  ...spinner,
});
