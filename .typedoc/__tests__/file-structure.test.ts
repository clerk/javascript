import { readdir } from 'fs/promises';
import { join, relative } from 'path';
import { describe, expect, it } from 'vitest';

// Same function as in custom-router.mjs
function toKebabCase(str: string) {
  return str.replace(/((?<=[a-z\d])[A-Z]|(?<=[A-Z\d])[A-Z](?=[a-z]))/g, '-$1').toLowerCase();
}

const OUTPUT_LOCATION = `${process.cwd()}/docs`;

async function scanDirectory(type: 'file' | 'directory' = 'file') {
  const arr: string[] = [];
  const dir = await readdir(OUTPUT_LOCATION, { recursive: true, withFileTypes: true });

  for (const entry of dir) {
    const relativePath = relative(OUTPUT_LOCATION, join(entry.parentPath, entry.name));

    if (type === 'file' && entry.isFile()) {
      arr.push(relativePath);
    } else if (type === 'directory' && entry.isDirectory()) {
      arr.push(relativePath);
    }
  }

  return arr;
}

describe('Typedoc output', () => {
  it('should only have these top-level folders', async () => {
    const folders = await scanDirectory('directory');

    expect(folders).toMatchInlineSnapshot(`
      [
        "clerk-react",
        "nextjs",
        "shared",
        "types",
        "types/interfaces",
        "types/type-aliases",
        "shared/index",
        "shared/react",
        "shared/react/hooks",
        "shared/react/types",
        "shared/react/types/interfaces",
        "shared/react/types/type-aliases",
        "shared/index/classes",
        "shared/index/functions",
        "nextjs/app-router",
        "nextjs/server",
        "nextjs/server/build-clerk-props",
        "nextjs/server/clerk-middleware",
        "nextjs/server/create-get-auth",
        "nextjs/server/create-get-auth/functions",
        "nextjs/server/create-get-auth/variables",
        "nextjs/server/clerk-middleware/interfaces",
        "nextjs/server/clerk-middleware/variables",
        "nextjs/server/build-clerk-props/variables",
        "nextjs/app-router/server",
        "nextjs/app-router/server/auth",
        "nextjs/app-router/server/current-user",
        "nextjs/app-router/server/current-user/functions",
        "nextjs/app-router/server/auth/variables",
        "clerk-react/functions",
        "clerk-react/interfaces",
      ]
    `);
  });
  it('should have a deliberate file structure', async () => {
    const files = await scanDirectory('file');

    expect(files).toMatchSnapshot();
  });
  it('should only contain lowercase files', async () => {
    const files = await scanDirectory('file');
    const upperCaseFiles = files.filter(file => /[A-Z]/.test(file));

    expect(upperCaseFiles).toHaveLength(0);
  });
  it('should only contain kebab-cased files', async () => {
    const files = await scanDirectory('file');
    const incorrectFiles = files.filter(file => file !== toKebabCase(file));

    expect(incorrectFiles).toHaveLength(0);
  });
  it('should not contain README files', async () => {
    const files = await scanDirectory('file');
    const readmeFiles = files.filter(file => file.includes('readme'));

    expect(readmeFiles).toHaveLength(0);
  });
});
