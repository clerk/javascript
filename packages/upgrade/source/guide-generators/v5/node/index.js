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
const name = 'node';
const properName = 'Node';
const packageName = '@clerk/clerk-sdk-node';
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
    singleItem('cjs-esm-instance'),
    markdown('node-setters-removals'),
    markdown('orgs-claim'),
    markdown('image-url'),
    accordionForCategory('image-url', {}),
    deprecationRemovalsAndHousekeeping(),
  ]);
}

generate().then(writeToFile(cwd));
