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
const name = 'nextjs';
const properName = 'Next.js';
const packageName = '@clerk/nextjs';
const cwd = 'v5/nextjs';

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
    markdown('nextjs-version'),
    markdownTemplate('update-v5', { packageName }),
    markdown('cli'),
    '## Breaking Changes',
    markdown('redesign-preview'),
    markdown('middleware-changes'),
    markdown('import-changes'),
    markdown('after-sign-x-handling'),
    markdown('orgs-claim'),
    markdown('path-routing'),
    markdown('image-url'),
    accordionForCategory('image-url', {}),
    deprecationRemovalsAndHousekeeping(['hof-removal', 'pagination-return', 'pagination-args', 'error-imports']),
  ]);
}

generate().then(writeToFile(cwd));
