export * from '@clerk/clerk-react';

// Override Clerk React error thrower to show that errors come from gatsby-plugin-clerk
import { setErrorThrowerOptions } from '@clerk/clerk-react/internal';
setErrorThrowerOptions({ packageName: PACKAGE_NAME });
