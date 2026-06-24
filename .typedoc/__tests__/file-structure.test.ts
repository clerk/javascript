import { readdir } from 'fs/promises';
import { join, relative } from 'path';
import { describe, expect, it } from 'vitest';

import { toUrlSlug } from '../slug.mjs';

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

function isTopLevelPath(filePath: string) {
  return !filePath.includes('/');
}

describe('Typedoc output', () => {
  it('should only have these top-level folders', async () => {
    const folders = await scanDirectory('directory');
    const topLevelFolders = folders.filter(isTopLevelPath);

    expect(topLevelFolders).toMatchInlineSnapshot(`
      [
        "backend",
        "nextjs",
        "react",
        "shared",
      ]
    `);
  });

  it('should only have these nested folders', async () => {
    const folders = await scanDirectory('directory');
    const nestedFolders = folders.filter(folder => !isTopLevelPath(folder)).sort((a, b) => a.localeCompare(b));

    expect(nestedFolders).toMatchInlineSnapshot(`
      [
        "backend/agent-task-api",
        "backend/agent-task-api/methods",
        "backend/allowlist-identifier-api",
        "backend/allowlist-identifier-api/methods",
        "backend/api-keys-api",
        "backend/api-keys-api/methods",
        "backend/billing-api",
        "backend/billing-api/methods",
        "backend/client-api",
        "backend/client-api/methods",
        "backend/domain-api",
        "backend/domain-api/methods",
        "backend/email-address-api",
        "backend/email-address-api/methods",
        "backend/enterprise-connection-api",
        "backend/enterprise-connection-api/methods",
        "backend/invitation-api",
        "backend/invitation-api/methods",
        "backend/machine-api",
        "backend/machine-api/methods",
        "backend/m2m-token-api",
        "backend/m2m-token-api/methods",
        "backend/o-auth-applications-api",
        "backend/o-auth-applications-api/methods",
        "backend/organization-api",
        "backend/organization-api/methods",
        "backend/phone-number-api",
        "backend/phone-number-api/methods",
        "backend/redirect-url-api",
        "backend/redirect-url-api/methods",
        "backend/session-api",
        "backend/session-api/methods",
        "backend/sign-in-token-api",
        "backend/sign-in-token-api/methods",
        "backend/testing-token-api",
        "backend/testing-token-api/methods",
        "backend/user-api",
        "backend/user-api/methods",
        "backend/waitlist-entry-api",
        "backend/waitlist-entry-api/methods",
        "react/legacy",
        "shared/api-key-resource",
        "shared/api-key-resource/methods",
        "shared/billing-namespace",
        "shared/billing-namespace/methods",
        "shared/clerk",
        "shared/clerk/methods",
        "shared/client-resource",
        "shared/client-resource/methods",
        "shared/organization-resource",
        "shared/organization-resource/methods",
        "shared/session-resource",
        "shared/session-resource/methods",
        "shared/sign-in-future-resource",
        "shared/sign-in-future-resource/methods",
        "shared/sign-up-future-resource",
        "shared/sign-up-future-resource/methods",
        "shared/user-resource",
        "shared/user-resource/methods",
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
    const incorrectFiles = files.filter(file => file !== toUrlSlug(file));

    expect(incorrectFiles).toHaveLength(0);
  });
  it('should not contain README files', async () => {
    const files = await scanDirectory('file');
    const readmeFiles = files.filter(file => file.includes('readme'));

    expect(readmeFiles).toHaveLength(0);
  });
});
