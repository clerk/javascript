import { setClerkJsLoadingErrorPackageName } from '@clerk/shared/loadClerkJsScript';

import { setErrorThrowerOptions } from './errors/errorThrower';

export * from './components';
export * from './composables';

export { clerkPlugin } from './plugin';

setErrorThrowerOptions({ packageName: PACKAGE_NAME });
setClerkJsLoadingErrorPackageName(PACKAGE_NAME);
