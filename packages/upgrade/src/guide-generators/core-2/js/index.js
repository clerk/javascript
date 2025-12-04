import {
  accordionForCategory,
  assembleContent,
  deprecationRemovalsAndHousekeeping,
  frontmatter,
  loadVersionChangeData,
  markdown,
  markdownTemplate,
  singleItem,
  writeToFile,
} from '../../text-generation.js';

const version = 'core-2';
const semverVersion = 'v5';
const name = 'js';
const properName = 'Javascript';
const packageName = '@clerk/clerk-js';
const cwd = `${version}/${name}`;

async function generate() {
  const data = await loadVersionChangeData(version, name);

  return assembleContent({ data, cwd }, [
    frontmatter({
      title: `Upgrading ${properName} to Core 2`,
      description: `Learn how to upgrade Clerk's ${properName} SDK to the latest version.`,
    }),
    `# Upgrading \`${packageName}\` to Core 2`,
    markdown('intro'),
    markdownTemplate('prepare', { version: semverVersion, packageName }),
    markdownTemplate('update-version', { packageName }),
    markdown('cli'),
    '## Breaking Changes',
    markdown('redesign-preview'),
    markdown('after-sign-x-handling'),
    singleItem('aftersignxurl-changes'),
    markdown('orgs-claim'),
    markdownTemplate('path-routing', { packageName }),
    markdown('image-url'),
    accordionForCategory('image-url'),
    markdown('pagination-args'),
    accordionForCategory('pagination-args'),
    markdown('pagination-return'),
    accordionForCategory('pagination-return'),
    // createOrganization args?
    // attemptweb3wallet?
    deprecationRemovalsAndHousekeeping(['error-imports']),
  ]);
}

void generate().then(writeToFile(cwd));
