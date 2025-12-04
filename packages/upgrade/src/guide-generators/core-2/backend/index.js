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
const name = 'backend';
const properName = 'Backend';
const packageName = '@clerk/backend';
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
    markdownTemplate('prepare', { version: 'v1', packageName }),
    markdown('node-version'),
    markdownTemplate('update-version', { packageName }),
    markdown('cli'),
    '## Breaking Changes',
    singleItem('authenticaterequest-params-change'),
    singleItem('clockskewinseconds'),
    markdown('import-paths'),
    accordionForCategory('import-paths'),
    singleItem('httpoptions-removed'),
    markdown('orgs-claim'),
    markdown('pagination-args'),
    accordionForCategory('pagination-args'),
    markdown('pagination-return'),
    accordionForCategory('pagination-return'),
    markdown('image-url'),
    accordionForCategory(['image-url', 'image-url-backend']),
    deprecationRemovalsAndHousekeeping(),
  ]);
}

void generate().then(writeToFile(cwd));
