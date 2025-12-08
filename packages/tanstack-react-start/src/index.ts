export * from './client/index';

// Override Clerk React error thrower to show that errors come from @clerk/tanstack-react-start
import { setErrorThrowerOptions } from '@clerk/react/internal';
setErrorThrowerOptions({ packageName: PACKAGE_NAME });
