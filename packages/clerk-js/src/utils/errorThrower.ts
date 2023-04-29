import { buildErrorThrower } from '@clerk/utils';

const errorThrower = buildErrorThrower({ packageName: __PKG_NAME__ });

export { errorThrower };
