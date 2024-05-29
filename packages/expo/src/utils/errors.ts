import { buildErrorThrower } from '@clerk/shared/error';

export const errorThrower = buildErrorThrower({ packageName: PACKAGE_NAME, customMessages: [] });
