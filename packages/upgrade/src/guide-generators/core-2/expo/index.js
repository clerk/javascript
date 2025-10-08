import {
  accordionForCategory,
  assembleContent,
  deprecationRemovalsAndHousekeeping,
  frontmatter,
  loadVersionChangeData,
  markdown,
  markdownTemplate,
  writeToFile,
} from '../../text-generation.js';

const version = 'core-2';
const semverVersion = 'v1';
const name = 'expo';
const properName = 'Expo';
const packageName = '@clerk/expo';
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
    markdownTemplate('update-version', { packageName }),
    markdown('cli'),
    '## Breaking Changes',
    markdown('redesign-preview'),
    markdown('after-sign-x-handling'),
    markdown('orgs-claim'),
    markdownTemplate('path-routing', { packageName }),
    markdown('image-url'),
    accordionForCategory('image-url'),
    deprecationRemovalsAndHousekeeping(['hof-removal', 'pagination-return', 'pagination-args', 'error-imports']),
  ]);
}

generate().then(writeToFile(cwd));
