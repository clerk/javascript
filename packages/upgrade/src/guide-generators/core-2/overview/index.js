import { assembleContent, frontmatter, markdown, writeToFile } from '../../text-generation.js';

const cwd = 'core-2/overview';

async function generate() {
  return await assembleContent({ data: {}, cwd }, [
    frontmatter({
      title: `Upgrading to Clerk Core 2`,
      description: `Learn how to upgrade to the latest version of Clerk's SDKs`,
    }),
    markdown('intro'),
  ]);
}

void generate().then(writeToFile(cwd));
