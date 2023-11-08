// @ts-check
const pkgJson = require('../package.json');

const log = (message = '') => process.stderr.write(`${message}\n`);

/**
 * @returns {string} The name of the package manager.
 */
function readPackageManager() {
  const match = process.env.npm_config_user_agent?.match(/^(?<pm>\w+)\//);
  return match?.groups ? match.groups?.pm : 'npm';
}

/**
 * @param {string} configName
 * @param {string} packageName
 */
module.exports = (configName, packageName) => {
  try {
    require.resolve(packageName);
  } catch (e) {
    const packageManager = readPackageManager();
    const command = packageManager === 'yarn' ? 'add' : 'install';

    log(`The \`${configName}\` config requires an optional peer dependency, which has not been installed.`);
    log();
    log('To install it, run:');
    log(`- ${packageManager} ${command} ${packageName}@${pkgJson.peerDependencies[packageName]}`);

    process.exit(1);
  }
};
