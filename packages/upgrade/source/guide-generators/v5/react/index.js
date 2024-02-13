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
const name = 'react';
const properName = 'React';
const packageName = '@clerk/clerk-react';
const cwd = `${version}/${name}`;

async function generate() {
  const data = loadVersionChangeData(version, name);

  return assembleContent({ data, cwd }, [
    frontmatter({
      title: `Upgrading ${properName} from v4 to v5`,
      description: `Learn how to upgrade Clerk's ${properName} SDK from v4 to v5.`,
    }),
    `# Upgrading \`${packageName}\` from v4 to v5`,
    markdown('intro'),
    markdown('prepare'),
    markdown('node-version'),
    markdown('react-version'),
    markdownTemplate('update-v5', { packageName }),
    markdown('cli'),
    '## Breaking Changes',
    markdown('redesign-preview'),
    markdown('after-sign-x-handling'),
    singleItem('navigate-to-routerpush-routerreplace'),
    markdown('orgs-claim'),
    markdown('path-routing'),
    markdown('image-url'),
    accordionForCategory('image-url', {}),
    deprecationRemovalsAndHousekeeping(),
  ]);
}

generate().then(writeToFile(cwd));
