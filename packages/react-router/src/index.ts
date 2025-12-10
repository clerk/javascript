if (typeof window !== 'undefined' && typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}

export * from './client';

// Override Clerk React error thrower to show that errors come from @clerk/react-router
import { setErrorThrowerOptions } from '@clerk/react/internal';
setErrorThrowerOptions({ packageName: PACKAGE_NAME });
