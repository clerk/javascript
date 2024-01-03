import { readPackageSync } from 'read-pkg';
import SDKS from '../constants/sdks.js';

export default function guessFrameworks() {
	const pkg = readPackageSync();
	const deps = Object.keys(pkg.dependencies);

	return SDKS.filter((pkgName, value) => {
		if (deps.includes(pkgName)) return value;
	});
}
