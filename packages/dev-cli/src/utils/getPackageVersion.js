import { createRequire } from 'node:module';

/**
 * Get the version of the dev-cli as specified in the `package.json` file.
 * @returns {string}
 */
export function getPackageVersion() {
  // Currently we use createRequire which allows us to import JSON files without logging a warning to the console about
  // the experimental nature of JSON file imports.
  const pkgJson = createRequire(import.meta.url)('../../package.json');
  return pkgJson.version;
}
