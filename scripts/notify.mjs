import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { globby as glob } from 'globby';

const { GITHUB_REF = 'main' } = process.env;
const baseUrl = new URL(`https://github.com/clerkinc/javascript/blob/${GITHUB_REF}/`);

/**
 * @returns {Promise<Map<string,{ version: string, path: string }>>}
 */
async function createPackageMap() {
  const map = new Map();
  const packagesRoot = new URL('../packages/', import.meta.url);
  const packages = await glob(['*/package.json', '*/*/package.json'], { cwd: fileURLToPath(packagesRoot) });
  await Promise.all(
    packages.map(async pkg => {
      const packageJsonPath = fileURLToPath(new URL(pkg, packagesRoot));
      const packageJson = fs.readJSONSync(packageJsonPath);
      if (!packageJson.private && packageJson.version) {
        const version = packageJson.version;
        const path = `./packages/${pkg.replace('/package.json', '')}`;
        map.set(packageJson.name, { version, path });
      }
    }),
  );
  return map;
}

const releasedPackages = JSON.parse(process.argv[2]);
const prNumber = process.argv[3];

// console.debug({ releasedPackages, prNumber });

const packageMap = await createPackageMap();
const packages = releasedPackages.map(({ name, version }) => {
  const pkg = packageMap.get(name);
  if (!pkg) {
    throw new Error(`Unable to find entrypoint for "${name}"!`);
  }
  const url = new URL(`${pkg.path}/CHANGELOG.md#${version.replace(/\./g, '')}`, baseUrl).toString();
  return { name, version, url };
});

let message = '';
message += `Javascript SDKs - Stable Release - ${new Date().toLocaleDateString('en-US')}\n\n`;
for (const { name, version, url } of packages) {
  message += `- \`${name}@${version}\` ([release notes ↗](<${url}>))\n`;
}

// TODO: Get PR number using the GitHub API
// if (prNumber) {
//   message += `\nView the [release PR ↗](<https://github.com/clerkinc/javascript/pull/${prNumber}>)`;
// }

console.log(message);
