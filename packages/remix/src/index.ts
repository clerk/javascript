import './globalPolyfill';

export * from './client';

// Override Clerk React error thrower to show that errors come from @clerk/remix
import { setErrorThrowerOptions } from '@clerk/clerk-react/internal';
setErrorThrowerOptions({ packageName: PACKAGE_NAME });
