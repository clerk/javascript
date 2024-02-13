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

const version = 'v5';
const name = 'backend';
const properName = 'Backend';
const packageName = '@clerk/backend';
const cwd = `${version}/${name}`;

async function generate() {
  const data = await loadVersionChangeData(version, name);

  return assembleContent({ data, cwd }, [
    frontmatter({
      title: `Upgrading ${properName} from v4 to v5`,
      description: `Learn how to upgrade Clerk's ${properName} SDK from v4 to v5.`,
    }),
    `# Upgrading \`${packageName}\` from v4 to v5`,
    markdown('intro'),
    markdown('prepare'),
    markdown('node-version'),
    markdownTemplate('update-v5', { packageName }),
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

generate().then(writeToFile(cwd));
