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
const name = 'nextjs';
const properName = 'Next.js';
const packageName = '@clerk/nextjs';
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
    markdown('node-version'),
    markdown('react-version'),
    markdown('nextjs-version'),
    markdownTemplate('update-version', { packageName }),
    markdown('cli'),
    '## Breaking Changes',
    markdown('redesign-preview'),
    markdown('middleware-changes'),
    markdown('import-changes'),
    markdown('after-sign-x-handling'),
    singleItem('aftersignxurl-changes'),
    markdown('orgs-claim'),
    markdownTemplate('path-routing', { packageName }),
    markdown('image-url'),
    accordionForCategory('image-url'),
    deprecationRemovalsAndHousekeeping(['hof-removal', 'pagination-return', 'pagination-args', 'error-imports']),
  ]);
}

void generate().then(writeToFile(cwd));
