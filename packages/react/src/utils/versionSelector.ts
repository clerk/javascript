import major from 'semver/functions/major';
import prerelease from 'semver/functions/prerelease';

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

const getPrereleaseTag = (packageVersion: string) => prerelease(packageVersion)?.[0].toString();
const getMajorVersion = (packageVersion: string) => major(packageVersion).toString();
