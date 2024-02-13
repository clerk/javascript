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
const name = 'js';
const properName = 'Javascript';
const packageName = '@clerk/clerk-js';
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
    markdownTemplate('update-v5', { packageName }),
    markdown('cli'),
    '## Breaking Changes',
    markdown('redesign-preview'),
    markdown('after-sign-x-handling'),
    markdown('orgs-claim'),
    markdown('path-routing'),
    markdown('image-url'),
    accordionForCategory('image-url'),
    markdown('pagination-args'),
    accordionForCategory('pagination-args'),
    markdown('pagination-return'),
    accordionForCategory('pagination-return'),
    // createOrganization args?
    // attemptweb3wallet?
    deprecationRemovalsAndHousekeeping(['error-imports']),
  ]);
}

generate().then(writeToFile(cwd));
