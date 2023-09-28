/**
 * This version selector is a bit complicated, so here is the flow:
 * 1. Use the clerkJSVersion prop on the provider
 * 2. Use the exact `@clerk/clerk-js` version if it is a `@snapshot` prerelease for `@clerk/clerk-react`
 * 3. Use the prerelease tag of `@clerk/clerk-react`
 * 4. Fallback to the major version of `@clerk/clerk-react`
 * @param clerkJSVersion - The optional clerkJSVersion prop on the provider
 * @returns The npm tag, version or major version to use
 */
export const versionSelector = (clerkJSVersion: string | undefined) => {
  if (clerkJSVersion) {
    return clerkJSVersion;
  }

  const prereleaseTag = getPrereleaseTag(PACKAGE_VERSION);
  if (prereleaseTag) {
    if (prereleaseTag === 'snapshot') {
      return JS_PACKAGE_VERSION;
    }

    return prereleaseTag;
  }

  return getMajorVersion(PACKAGE_VERSION);
};

// TODO: Replace these with "semver" package
const getPrereleaseTag = (packageVersion: string) => packageVersion.match(/-(.*)\./)?.[1];
const getMajorVersion = (packageVersion: string) => packageVersion.split('.')[0];
