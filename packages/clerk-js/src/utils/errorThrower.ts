import { buildErrorThrower } from '@clerk/shared/error';

const errorThrower = buildErrorThrower({ packageName: __PKG_NAME__ });

export { errorThrower };
