import nextPkg from 'next/package.json';

const isNext13 = nextPkg.version.startsWith('13.');

/**
 * Those versions are affected by a bundling issue that will break the application if `node:fs` is used inside a server function.
 * The affected versions are >=next@13.5.4 and <=next@14.0.4
 */
const isNextWithUnstableServerActions = isNext13 || nextPkg.version.startsWith('14.0');

export { isNext13, isNextWithUnstableServerActions };
