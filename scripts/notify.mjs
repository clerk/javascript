import { fileURLToPath } from 'node:url';

import fs from 'fs-extra';
import { glob } from 'tinyglobby';

const { GITHUB_REF = 'main' } = process.env;
const baseUrl = new URL(`https://github.com/clerk/javascript/blob/${GITHUB_REF}/`);

const getReleaseChannel = version => {
  if (version?.includes('alpha')) {
    return 'Alpha';
  } else if (version?.includes('beta')) {
    return 'Beta';
  } else {
    return 'Stable';
  }
};

/**
 * @typedef {Object} PackageData
 * @property {string} name
 * @property {string} version
 * @property {string} changelogUrl
 */

/**
 * @typedef {Object} Pusher
 * @property {string} username
 * @property {string} avatarUrl
 * @property {string} profileUrl
 */

/**
 * @typedef {Object} ChangelogData
 * @property {PackageData[]} packageData
 * @property {string} releasePrUrl
 * @property {Pusher} pusher
 */

/**
 * @typedef {Object} Formatter
 * @property {(data: ChangelogData) => string} generateChangelog
 */

/**
 * Slack is using their own Markdown format, see:
 * https://api.slack.com/reference/surfaces/formatting#basics
 * https://app.slack.com/block-kit-builder
 * @type {Formatter}
 */
const slackFormatter = {
  generateChangelog: ({ packageData, releasePrUrl, pusher }) => {
    const markdown = text => ({ type: 'section', text: { type: 'mrkdwn', text } });
    const header = text => ({ type: 'header', text: { type: 'plain_text', text } });
    const context = (imgUrl, text) => ({
      type: 'context',
      elements: [
        ...(imgUrl ? [{ type: 'image', image_url: imgUrl, alt_text: 'avatar' }] : []),
        { type: 'mrkdwn', text },
      ],
    });
    const blocks = [];

    const releaseChannel = getReleaseChannel(packageData?.[0]?.version);
    blocks.push(header(`Javascript SDKs - ${releaseChannel} Release - ${new Date().toLocaleDateString('en-US')}`));
    blocks.push(markdown(`All release PRs for this day can be found <${releasePrUrl}|here>.\nReleased packages:\n`));

    createPackagesBody(packageData).forEach(body => {
      blocks.push(markdown(body));
    });

    blocks.push(markdown('\n'));
    blocks.push(context(pusher.avatarUrl, `<${pusher.profileUrl}|*${pusher.username}*> triggered this release.`));

    return JSON.stringify({ blocks });
  },
};

/**
 * @property {PackageData[]} packageData
 */
const createPackagesBody = packageData => {
  // The Slack API has a limitation of ~3000 characters per block and
  // also there is a limit on the number of blocks that can be sent in a single message.
  // So, we split the body into fragments of 10 packages each.
  const fragments = [];
  let body = '';
  let count = 0;
  for (const { name, version, changelogUrl } of packageData) {
    body += `• <${changelogUrl}|Changelog> - \`${name}@${version}\`\n`;
    count++;

    if (count === 10) {
      fragments.push(body);
      body = '';
      count = 0;
    }
  }
  // This is the remaining
  if (body) {
    fragments.push(body);
  }

  return fragments;
};

/**
 * @type {Record<string, Formatter>}
 */
const formatters = {
  slack: slackFormatter,
};

const run = async () => {
  const releasedPackages = JSON.parse(process.argv[2]);
  const packageToPathMap = await createPackageToPathMap();
  const packageData = createPackageData(releasedPackages, packageToPathMap);
  const releasePrUrl = createReleasePrUrl();
  const pusher = createPusher(process.argv[3]);
  const data = { packageData, releasePrUrl, pusher };

  // TODO: Add support for more formatters
  const formatter = formatters['slack'];
  if (!formatter) {
    throw new Error('Invalid formatter, supported formatters are: ' + Object.keys(formatters).join(', '));
  }
  console.log(formatter.generateChangelog(data));
};

run();

/*
 * @returns {Pusher}
 */
const createPusher = username => {
  return { username, avatarUrl: `https://github.com/${username}.png`, profileUrl: `https://github.com/${username}` };
};

/**
 * @returns {Promise<Map<string,string>>}
 */
async function createPackageToPathMap() {
  const map = new Map();
  const packagesRoot = new URL('../packages/', import.meta.url);
  const packages = await glob(['*/package.json', '*/*/package.json'], { cwd: fileURLToPath(packagesRoot) });
  await Promise.all(
    packages.map(async pkg => {
      const packageJsonPath = fileURLToPath(new URL(pkg, packagesRoot));
      const packageJson = fs.readJSONSync(packageJsonPath);
      if (!packageJson.private && packageJson.version) {
        map.set(packageJson.name, `./packages/${pkg.replace('/package.json', '')}`);
      }
    }),
  );
  return map;
}

/**
 * @returns {PackageData[]}
 */
const createPackageData = (releasedPackages, packageToPathMap) => {
  return releasedPackages.map(({ name, version }) => {
    const relativePath = packageToPathMap.get(name);
    if (!relativePath) {
      throw new Error(`Not found: "${relativePath}"!`);
    }
    const changelogUrl = new URL(`${relativePath}/CHANGELOG.md#${version.replace(/\./g, '')}`, baseUrl).toString();
    return { name, version, changelogUrl };
  });
};

/**
 * @returns {string}
 */
const createReleasePrUrl = () => {
  // TODO: Get PR number using the GitHub API
  // if (prNumber) {
  //   message += `\nView <https://github.com/clerk/javascript/pull/${prNumber}|release PR>`;
  // }
  return `https://github.com/clerk/javascript/pulls?q=is%3Apr+is%3Aclosed+Version+Packages+in%3Atitle+merged%3A${new Date()
    .toISOString()
    .slice(0, 10)}`;
};
