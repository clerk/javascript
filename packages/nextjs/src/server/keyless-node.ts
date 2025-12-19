import { createKeylessService, type KeylessStorage } from '@clerk/shared/keyless';

import { createClerkClientWithOptions } from './createClerkClient';
import { nodeCwdOrThrow, nodeFsOrThrow, nodePathOrThrow } from './fs/utils';

const CLERK_HIDDEN = '.clerk';
const CLERK_LOCK = 'clerk.lock';
const TEMP_DIR_NAME = '.tmp';
const CONFIG_FILE = 'keyless.json';
const README_FILE = 'README.md';

function createFileStorage(): KeylessStorage {
  const fs = nodeFsOrThrow();
  const path = nodePathOrThrow();
  const cwd = nodeCwdOrThrow();

  let inMemoryLock = false;

  const getClerkDir = () => path.join(cwd(), CLERK_HIDDEN);
  const getTempDir = () => path.join(getClerkDir(), TEMP_DIR_NAME);
  const getConfigPath = () => path.join(getTempDir(), CONFIG_FILE);
  const getReadmePath = () => path.join(getTempDir(), README_FILE);
  const getLockPath = () => path.join(cwd(), CLERK_LOCK);

  const isLocked = (): boolean => inMemoryLock || fs.existsSync(getLockPath());

  const lock = (): boolean => {
    if (isLocked()) {
      return false;
    }
    inMemoryLock = true;
    try {
      fs.writeFileSync(getLockPath(), 'This file can be deleted if your app is stuck.', {
        encoding: 'utf8',
        mode: 0o644,
      });
      return true;
    } catch {
      inMemoryLock = false;
      return false;
    }
  };

  const unlock = (): void => {
    inMemoryLock = false;
    try {
      if (fs.existsSync(getLockPath())) {
        fs.rmSync(getLockPath(), { force: true });
      }
    } catch {
      // Ignore
    }
  };

  const ensureDirectoryExists = () => {
    const tempDir = getTempDir();
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  };

  const updateGitignore = () => {
    const gitignorePath = path.join(cwd(), '.gitignore');
    const entry = `/${CLERK_HIDDEN}/`;

    if (!fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, '', { encoding: 'utf8', mode: 0o644 });
    }

    const content = fs.readFileSync(gitignorePath, 'utf-8');
    if (!content.includes(entry)) {
      fs.appendFileSync(gitignorePath, `\n# clerk configuration (can include secrets)\n${entry}\n`);
    }
  };

  const writeReadme = () => {
    const readme = `## DO NOT COMMIT
This directory is auto-generated from \`@clerk/nextjs\` because you are running in Keyless mode.
Avoid committing the \`.clerk/\` directory as it includes the secret key of the unclaimed instance.
`;
    fs.writeFileSync(getReadmePath(), readme, { encoding: 'utf8', mode: 0o600 });
  };

  return {
    read(): string {
      try {
        if (!fs.existsSync(getConfigPath())) {
          return '';
        }
        return fs.readFileSync(getConfigPath(), { encoding: 'utf-8' });
      } catch {
        return '';
      }
    },

    write(data: string): void {
      if (!lock()) {
        return;
      }
      try {
        ensureDirectoryExists();
        updateGitignore();
        writeReadme();
        fs.writeFileSync(getConfigPath(), data, { encoding: 'utf8', mode: 0o600 });
      } finally {
        unlock();
      }
    },

    remove(): void {
      if (!lock()) {
        return;
      }
      try {
        if (fs.existsSync(getClerkDir())) {
          fs.rmSync(getClerkDir(), { recursive: true, force: true });
        }
      } finally {
        unlock();
      }
    },
  };
}

// Lazily initialized keyless service singleton
let keylessServiceInstance: ReturnType<typeof createKeylessService> | null = null;

export function keyless() {
  if (!keylessServiceInstance) {
    const client = createClerkClientWithOptions({});

    keylessServiceInstance = createKeylessService({
      storage: createFileStorage(),
      api: {
        async createAccountlessApplication(requestHeaders?: Headers) {
          try {
            return await client.__experimental_accountlessApplications.createAccountlessApplication({
              requestHeaders,
            });
          } catch {
            return null;
          }
        },
        async completeOnboarding(requestHeaders?: Headers) {
          try {
            return await client.__experimental_accountlessApplications.completeAccountlessApplicationOnboarding({
              requestHeaders,
            });
          } catch {
            return null;
          }
        },
      },
      framework: 'nextjs',
    });
  }
  return keylessServiceInstance;
}
