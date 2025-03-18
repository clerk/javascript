import { warnPackageRenaming } from './utils/errors';

warnPackageRenaming();

export * from './client/index';

// Override Clerk React error thrower to show that errors come from @clerk/tanstack-start
import { setErrorThrowerOptions } from '@clerk/clerk-react/internal';
setErrorThrowerOptions({ packageName: PACKAGE_NAME });
