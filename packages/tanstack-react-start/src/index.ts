export * from './client/index';
export { getToken } from '@clerk/shared/getToken';

// Override Clerk React error thrower to show that errors come from @clerk/tanstack-react-start
import { setErrorThrowerOptions } from '@clerk/react/internal';
setErrorThrowerOptions({ packageName: PACKAGE_NAME });
