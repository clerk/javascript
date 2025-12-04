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
const name = 'node';
const properName = 'Node';
const packageName = '@clerk/clerk-sdk-node';
const cwd = `${version}/${name}`;

async function generate() {
  const data = await loadVersionChangeData(version, name);

  return assembleContent({ data, cwd }, [
    frontmatter({
      title: `Upgrading ${properName} to Core 2`,
      description: `Learn how to upgrade Clerk's ${properName} SDK to the lastest version.`,
    }),
    `# Upgrading \`${packageName}\` to Core 2`,
    markdown('intro'),
    markdownTemplate('prepare', { version: semverVersion, packageName }),
    markdown('node-version'),
    markdownTemplate('update-version', { packageName }),
    markdown('cli'),
    '## Breaking Changes',
    singleItem('cjs-esm-instance'),
    markdown('node-setters-removals'),
    markdown('orgs-claim'),
    markdown('image-url'),
    accordionForCategory('image-url'),
    deprecationRemovalsAndHousekeeping(['pagination-return', 'pagination-args', 'error-imports']),
  ]);
}

void generate().then(writeToFile(cwd));
