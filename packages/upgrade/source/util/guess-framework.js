import { readPackageSync } from 'read-pkg';
import SDKS from '../constants/sdks.js';

export default function guessFrameworks(dir) {
	const pkg = readPackageSync({ cwd: dir });
	if (!pkg.dependencies) return []; // no guessing if there are no deps
	const deps = Object.keys(pkg.dependencies);

	return SDKS.reduce((m, { label, value }) => {
		if (deps.includes(label)) m.push({ label, value });
		return m;
	}, []);
}
