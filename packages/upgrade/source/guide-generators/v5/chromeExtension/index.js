import {
  accordionForCategory,
  assembleContent,
  frontmatter,
  loadVersionChangeData,
  markdown,
  markdownTemplate,
  singleItem,
  writeToFile,
} from '../../text-generation.js';

const version = 'v5';
const name = 'chromeExtension';
const properName = 'Chrome Extension';
const packageName = '@clerk/chrome-extension';
const cwd = `${version}/chromeExtension`;

async function generate() {
  const data = await loadVersionChangeData(version, name);

  return assembleContent({ data, cwd }, [
    frontmatter({
      title: `Upgrading ${properName} SDK from v4 to v5`,
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
    singleItem('clerkprovider-tokencache'),
    markdown('redesign-preview'),
    markdown('after-sign-x-handling'),
    markdown('orgs-claim'),
    markdown('path-routing'),
    markdown('image-url'),
    accordionForCategory('image-url'),
  ]);
}

generate().then(writeToFile(cwd));
