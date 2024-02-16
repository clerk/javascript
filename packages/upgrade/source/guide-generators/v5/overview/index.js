import { assembleContent, frontmatter, markdown, writeToFile } from '../../text-generation.js';

const cwd = 'v5/overview';

async function generate() {
  return assembleContent({ data: {}, cwd }, [
    frontmatter({
      title: `Upgrading from v4 to v5 core`,
      description: `Learn how to upgrade from v4 to v5 core for Clerk's SDKs`,
    }),
    markdown('intro'),
  ]);
}

generate().then(writeToFile(cwd));
