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

const version = 'v5';
const name = 'gatsby';
const properName = 'Gatsby';
const packageName = 'gatsby-plugin-clerk';
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
    markdownTemplate('prepare', { version, packageName }),
    markdown('node-version'),
    markdown('react-version'),
    markdownTemplate('update-version', { packageName: 'gatsby-plugin-clerk' }),
    markdown('cli'),
    '## Breaking Changes',
    markdown('redesign-preview'),
    markdown('after-sign-x-handling'),
    markdown('orgs-claim'),
    markdownTemplate('path-routing', { packageName }),
    markdown('image-url'),
    accordionForCategory('image-url'),
    deprecationRemovalsAndHousekeeping(),
  ]);
}

generate().then(writeToFile(cwd));
