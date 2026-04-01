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
const name = 'react';
const properName = 'React';
const packageName = '@clerk/clerk-react';
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
    markdownTemplate('prepare', { packageName, version: semverVersion }),
    markdown('node-version'),
    markdown('react-version'),
    markdownTemplate('update-version', { packageName }),
    markdown('cli'),
    '## Breaking Changes',
    markdown('redesign-preview'),
    markdown('after-sign-x-handling'),
    singleItem('aftersignxurl-changes'),
    singleItem('navigate-to-routerpush-routerreplace'),
    markdown('orgs-claim'),
    markdownTemplate('path-routing', { packageName }),
    markdown('image-url'),
    accordionForCategory('image-url'),
    deprecationRemovalsAndHousekeeping(['hof-removal', 'pagination-return', 'pagination-args', 'error-imports']),
  ]);
}

void generate().then(writeToFile(cwd));
