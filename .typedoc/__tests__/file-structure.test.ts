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
        "backend",
        "clerk-react",
        "nextjs",
        "shared",
      ]
    `);
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
