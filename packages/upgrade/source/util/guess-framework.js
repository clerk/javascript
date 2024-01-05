import { readPackageSync } from 'read-pkg';
import SDKS from '../constants/sdks.js';

export default function guessFrameworks() {
	const pkg = readPackageSync();
	if (!pkg.dependencies) return []; // no guessing if there are no deps
	const deps = Object.keys(pkg.dependencies);

	return SDKS.filter((pkgName, value) => {
		if (deps.includes(pkgName)) return value;
	});
}
