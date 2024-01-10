import { readPackageSync } from 'read-pkg';
import semverRegex from 'semver-regex';

export default function getClerkMajorVersion() {
	const pkg = readPackageSync();
	const clerk = pkg.dependencies.clerk;
	return clerk ? semverRegex.exec(clerk)[0][0] : false;
}
