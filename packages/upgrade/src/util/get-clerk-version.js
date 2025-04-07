import { readPackageSync } from 'read-pkg';
import semverRegex from 'semver-regex';

export function getClerkSdkVersion(sdk) {
  const pkg = readPackageSync();
  const clerkSdk = pkg.dependencies[`@clerk/${sdk}`];
  if (!clerkSdk) {
    return false;
  }

  try {
    return getMajorVersion(clerkSdk.replace('^', '').replace('~', ''));
  } catch {
    return false;
  }
}

function getMajorVersion(semver) {
  const match = semver.match(semverRegex());
  if (match) {
    const [major] = match[0].split('.');
    return parseInt(major, 10); // Return as an integer
  }
  throw new Error('Invalid semver string');
}
