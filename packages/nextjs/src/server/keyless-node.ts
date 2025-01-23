import type { AccountlessApplication } from '@clerk/backend';

/**
 * Attention: Only import this module when the node runtime is used.
 * We are using conditional imports to mitigate bundling issues with Next.js server actions on version prior to 14.1.0.
 */
// @ts-ignore
import nodeRuntime from '#safe-node-apis';

import { createClerkClientWithOptions } from './createClerkClient';

/**
 * The Clerk-specific directory name.
 */
const CLERK_HIDDEN = '.clerk';

/**
 * The Clerk-specific lock file that is used to mitigate multiple key creation.
 * This is automatically cleaned up.
 */
const CLERK_LOCK = 'clerk.lock';

const throwMissingFsModule = () => {
  throw new Error("Clerk: fsModule.fs is missing. This is an internal error. Please contact Clerk's support.");
};

const safeNodeRuntimeFs = () => {
  if (!nodeRuntime.fs) {
    throwMissingFsModule();
  }
  return nodeRuntime.fs;
};

const safeNodeRuntimePath = () => {
  if (!nodeRuntime.path) {
    throwMissingFsModule();
  }
  return nodeRuntime.path;
};

/**
 * The `.clerk/` directory is NOT safe to be committed as it may include sensitive information about a Clerk instance.
 * It may include an instance's secret key and the secret token for claiming that instance.
 */
function updateGitignore() {
  const { existsSync, writeFileSync, readFileSync, appendFileSync } = safeNodeRuntimeFs();

  const path = safeNodeRuntimePath();
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (!existsSync(gitignorePath)) {
    writeFileSync(gitignorePath, '');
  }

  // Check if `.clerk/` entry exists in .gitignore
  const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
  const COMMENT = `# clerk configuration (can include secrets)`;
  if (!gitignoreContent.includes(CLERK_HIDDEN + '/')) {
    appendFileSync(gitignorePath, `\n${COMMENT}\n/${CLERK_HIDDEN}/\n`);
  }
}

const generatePath = (...slugs: string[]) => {
  const path = safeNodeRuntimePath();
  return path.join(process.cwd(), CLERK_HIDDEN, ...slugs);
};

const _TEMP_DIR_NAME = '.tmp';
const getKeylessConfigurationPath = () => generatePath(_TEMP_DIR_NAME, 'keyless.json');
const getKeylessReadMePath = () => generatePath(_TEMP_DIR_NAME, 'README.md');

let isCreatingFile = false;

export function safeParseClerkFile(): AccountlessApplication | undefined {
  const { readFileSync } = safeNodeRuntimeFs();
  try {
    const CONFIG_PATH = getKeylessConfigurationPath();
    let fileAsString;
    try {
      fileAsString = readFileSync(CONFIG_PATH, { encoding: 'utf-8' }) || '{}';
    } catch {
      fileAsString = '{}';
    }
    return JSON.parse(fileAsString) as AccountlessApplication;
  } catch {
    return undefined;
  }
}

/**
 * Using both an in-memory and file system lock seems to be the most effective solution.
 */
const lockFileWriting = () => {
  const { writeFileSync } = safeNodeRuntimeFs();

  isCreatingFile = true;

  writeFileSync(
    CLERK_LOCK,
    // In the rare case, the file persists give the developer enough context.
    'This file can be deleted. Please delete this file and refresh your application',
    {
      encoding: 'utf8',
      mode: '0777',
      flag: 'w',
    },
  );
};

const unlockFileWriting = () => {
  const { rmSync } = safeNodeRuntimeFs();

  try {
    rmSync(CLERK_LOCK, { force: true, recursive: true });
  } catch {
    // Simply ignore if the removal of the directory/file fails
  }

  isCreatingFile = false;
};

const isFileWritingLocked = () => {
  const { existsSync } = safeNodeRuntimeFs();
  return isCreatingFile || existsSync(CLERK_LOCK);
};

async function createOrReadKeyless(): Promise<AccountlessApplication | undefined> {
  const { writeFileSync, mkdirSync } = safeNodeRuntimeFs();

  /**
   * If another request is already in the process of acquiring keys return early.
   * Using both an in-memory and file system lock seems to be the most effective solution.
   */
  if (isFileWritingLocked()) {
    return undefined;
  }

  lockFileWriting();

  const CONFIG_PATH = getKeylessConfigurationPath();
  const README_PATH = getKeylessReadMePath();

  mkdirSync(generatePath(_TEMP_DIR_NAME), { recursive: true });
  updateGitignore();

  /**
   * When the configuration file exists, always read the keys from the file
   */
  const envVarsMap = safeParseClerkFile();
  if (envVarsMap?.publishableKey && envVarsMap?.secretKey) {
    unlockFileWriting();

    return envVarsMap;
  }

  /**
   * At this step, it is safe to create new keys and store them.
   */
  const client = createClerkClientWithOptions({});
  const accountlessApplication = await client.__experimental_accountlessApplications.createAccountlessApplication();

  writeFileSync(CONFIG_PATH, JSON.stringify(accountlessApplication), {
    encoding: 'utf8',
    mode: '0777',
    flag: 'w',
  });

  // TODO-KEYLESS: Add link to official documentation.
  const README_NOTIFICATION = `
## DO NOT COMMIT
This directory is auto-generated from \`@clerk/nextjs\` because you are running in Keyless mode. Avoid committing the \`.clerk/\` directory as it includes the secret key of the unclaimed instance.
  `;

  writeFileSync(README_PATH, README_NOTIFICATION, {
    encoding: 'utf8',
    mode: '0777',
    flag: 'w',
  });

  /**
   * Clean up locks.
   */
  unlockFileWriting();

  return accountlessApplication;
}

function removeKeyless() {
  const { rmSync } = safeNodeRuntimeFs();

  /**
   * If another request is already in the process of acquiring keys return early.
   * Using both an in-memory and file system lock seems to be the most effective solution.
   */
  if (isFileWritingLocked()) {
    return undefined;
  }

  lockFileWriting();

  try {
    rmSync(generatePath(), { force: true, recursive: true });
  } catch {
    // Simply ignore if the removal of the directory/file fails
  }

  /**
   * Clean up locks.
   */
  unlockFileWriting();
}

export { createOrReadKeyless, removeKeyless };
