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
const semverVersion = 'v4';
const name = 'remix';
const properName = 'Remix';
const packageName = '@clerk/remix';
const cwd = `${version}/${name}`;

async function generate() {
  const data = await loadVersionChangeData(version, name);

  return assembleContent({ data: data, cwd }, [
    frontmatter({
      title: `Upgrading ${properName} to Core 2`,
      description: `Learn how to upgrade from the Clerk ${properName} SDK to the latest version.`,
    }),
    `# Upgrading \`${packageName}\` to Core 2`,
    markdown('intro'),
    markdownTemplate('prepare', { version: semverVersion, packageName }),
    markdown('node-version'),
    markdown('react-version'),
    markdownTemplate('update-version', { packageName }),
    markdown('cli'),
    '## Breaking Changes',
    singleItem('clerkerrorboundary-removed'),
    markdown('redesign-preview'),
    markdown('after-sign-x-handling'),
    singleItem('aftersignxurl-changes'),
    markdown('orgs-claim'),
    markdownTemplate('path-routing', { packageName }),
    markdown('image-url'),
    accordionForCategory('image-url'),
    deprecationRemovalsAndHousekeeping(),
  ]);
}

void generate().then(writeToFile(cwd));
