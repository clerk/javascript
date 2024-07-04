const HARDCODED_LATEST_CLERK_JS_VERSION = '5';

export const versionSelector = (clerkJSVersion: string | undefined): string => {
  if (clerkJSVersion) {
    return clerkJSVersion;
  }

  return HARDCODED_LATEST_CLERK_JS_VERSION;
};
