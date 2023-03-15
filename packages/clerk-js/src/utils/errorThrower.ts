import { buildErrorThrower } from '@clerk/shared';

const errorThrower = buildErrorThrower({ packageName: __PKG_NAME__ });

export { errorThrower };
