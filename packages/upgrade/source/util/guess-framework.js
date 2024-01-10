import { readPackageSync } from 'read-pkg';
import SDKS from '../constants/sdks.js';

export default function guessFrameworks(dir) {
	const pkg = readPackageSync({ cwd: dir });

	// no guessing if there are no deps
	if (!pkg.dependencies && !pkg.devDependencies) return [];
	const deps = pkg.dependencies ? Object.keys(pkg.dependencies) : [];
	const devDeps = pkg.devDependencies ? Object.keys(pkg.devDependencies) : [];

	return SDKS.reduce((m, { label, value }) => {
		if (deps.includes(label) || devDeps.includes(label)) m.push({ label, value });
		return m;
	}, []);
}
