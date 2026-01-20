import { setClerkJsLoadingErrorPackageName } from '@clerk/shared/loadClerkJsScript';

import { setErrorThrowerOptions } from './errors/errorThrower';

export * from './components';
export * from './composables';

export { clerkPlugin, type PluginOptions } from './plugin';
export { updateClerkOptions } from './utils';
export { getToken } from '@clerk/shared/getToken';

setErrorThrowerOptions({ packageName: PACKAGE_NAME });
setClerkJsLoadingErrorPackageName(PACKAGE_NAME);
