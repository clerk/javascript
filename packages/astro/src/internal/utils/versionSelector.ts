<<<<<<< HEAD
const HARDCODED_LATEST_CLERK_JS_VERSION = '5';

=======
>>>>>>> 956f8a51b (feat(astro): Introduce Astro SDK)
export const versionSelector = (clerkJSVersion: string | undefined): string => {
  if (clerkJSVersion) {
    return clerkJSVersion;
  }

<<<<<<< HEAD
  return HARDCODED_LATEST_CLERK_JS_VERSION;
=======
  return '5';
>>>>>>> 956f8a51b (feat(astro): Introduce Astro SDK)
};
