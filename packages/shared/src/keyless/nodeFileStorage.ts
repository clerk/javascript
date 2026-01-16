import type { KeylessStorage } from './service';

const CLERK_HIDDEN = '.clerk';
const CLERK_LOCK = 'clerk.lock';
const TEMP_DIR_NAME = '.tmp';
const CONFIG_FILE = 'keyless.json';
const README_FILE = 'README.md';

export interface NodeFileStorageOptions {
  /**
   * Function that returns the current working directory.
   * Defaults to process.cwd().
   */
  cwd?: () => string;

  /**
   * The framework name for the README message.
   * @example '@clerk/nextjs'
   */
  frameworkPackageName?: string;
}

export interface FileSystemAdapter {
  existsSync: (path: string) => boolean;
  readFileSync: (path: string, options: { encoding: BufferEncoding }) => string;
  writeFileSync: (path: string, data: string, options: { encoding: BufferEncoding; mode?: number }) => void;
  appendFileSync: (path: string, data: string) => void;
  mkdirSync: (path: string, options: { recursive: boolean }) => void;
  rmSync: (path: string, options: { force?: boolean; recursive?: boolean }) => void;
}

export interface PathAdapter {
  join: (...paths: string[]) => string;
}

/**
 * Creates a file-based storage adapter for keyless mode.
 * This is used by Node.js-based frameworks (Next.js, TanStack Start, etc.)
 * to persist keyless configuration to the file system.
 *
 * @param fs - Node.js fs module or compatible adapter
 * @param path - Node.js path module or compatible adapter
 * @param options - Configuration options
 * @returns A KeylessStorage implementation
 */
export function createNodeFileStorage(
  fs: FileSystemAdapter,
  path: PathAdapter,
  options: NodeFileStorageOptions = {},
): KeylessStorage {
  const { cwd = () => process.cwd(), frameworkPackageName = '@clerk/shared' } = options;

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

    const content = fs.readFileSync(gitignorePath, { encoding: 'utf-8' });
    if (!content.includes(entry)) {
      fs.appendFileSync(gitignorePath, `\n# clerk configuration (can include secrets)\n${entry}\n`);
    }
  };

  const writeReadme = () => {
    const readme = `## DO NOT COMMIT
This directory is auto-generated from \`${frameworkPackageName}\` because you are running in Keyless mode.
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
