/**
 * This version selector is a bit complicated, so here is the flow:
 * 1. Use the clerkJSVersion prop on the provider
 * 2. Use the exact `@clerk/clerk-js` version if it is a `@snapshot` prerelease
 * 3. Use the prerelease tag of `@clerk/clerk-js` or the packageVersion provided
 * 4. Fallback to the major version of `@clerk/clerk-js` or the packageVersion provided
 *
 * @param clerkJSVersion - The optional clerkJSVersion prop on the provider
 * @param packageVersion - The version of `@clerk/clerk-js` that will be used if an explicit version is not provided
 * @returns The npm tag, version or major version to use
 */
export const versionSelector = (clerkJSVersion: string | undefined, packageVersion = JS_PACKAGE_VERSION) => {
  if (clerkJSVersion) {
    return clerkJSVersion;
  }

  const prereleaseTag = getPrereleaseTag(packageVersion);
  if (prereleaseTag) {
    if (prereleaseTag === 'snapshot') {
      return JS_PACKAGE_VERSION;
    }

    return prereleaseTag;
  }

  return getMajorVersion(packageVersion);
};

const getPrereleaseTag = (packageVersion: string) =>
  packageVersion
    .trim()
    .replace(/^v/, '')
    .match(/-(.+?)(\.|$)/)?.[1];

export const getMajorVersion = (packageVersion: string) => packageVersion.trim().replace(/^v/, '').split('.')[0];
