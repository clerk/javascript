import { buildErrorThrower } from '@clerk/shared/error';

const errorThrower = buildErrorThrower({ packageName: PACKAGE_NAME });

export { errorThrower };
