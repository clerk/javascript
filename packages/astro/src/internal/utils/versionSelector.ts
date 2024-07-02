export const versionSelector = (clerkJSVersion: string | undefined): string => {
  if (clerkJSVersion) {
    return clerkJSVersion;
  }

  return '5';
};
