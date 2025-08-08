import type { AccountlessApplication } from '@clerk/backend';

import { createClerkClientWithOptions } from './createClerkClient';
import { nodeCwdOrThrow, nodeFsOrThrow, nodePathOrThrow } from './fs/utils';
import { collectKeylessMetadata, formatMetadataHeaders } from './keyless-custom-headers';

/**
 * The Clerk-specific directory name.
 */
const CLERK_HIDDEN = '.clerk';

/**
 * The Clerk-specific lock file that is used to mitigate multiple key creation.
 * This is automatically cleaned up.
 */
const CLERK_LOCK = 'clerk.lock';

/**
 * The `.clerk/` directory is NOT safe to be committed as it may include sensitive information about a Clerk instance.
 * It may include an instance's secret key and the secret token for claiming that instance.
 */
function updateGitignore() {
  const { existsSync, writeFileSync, readFileSync, appendFileSync } = nodeFsOrThrow();

  const path = nodePathOrThrow();
  const cwd = nodeCwdOrThrow();
  const gitignorePath = path.join(cwd(), '.gitignore');
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
  const path = nodePathOrThrow();
  const cwd = nodeCwdOrThrow();
  return path.join(cwd(), CLERK_HIDDEN, ...slugs);
};

const _TEMP_DIR_NAME = '.tmp';
const getKeylessConfigurationPath = () => generatePath(_TEMP_DIR_NAME, 'keyless.json');
const getKeylessReadMePath = () => generatePath(_TEMP_DIR_NAME, 'README.md');

let isCreatingFile = false;

export function safeParseClerkFile(): AccountlessApplication | undefined {
  const { readFileSync } = nodeFsOrThrow();
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
  const { writeFileSync } = nodeFsOrThrow();

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
  const { rmSync } = nodeFsOrThrow();

  try {
    rmSync(CLERK_LOCK, { force: true, recursive: true });
  } catch {
    // Simply ignore if the removal of the directory/file fails
  }

  isCreatingFile = false;
};

const isFileWritingLocked = () => {
  const { existsSync } = nodeFsOrThrow();
  return isCreatingFile || existsSync(CLERK_LOCK);
};

async function createOrReadKeyless(): Promise<AccountlessApplication | null> {
  const { writeFileSync, mkdirSync } = nodeFsOrThrow();

  /**
   * If another request is already in the process of acquiring keys return early.
   * Using both an in-memory and file system lock seems to be the most effective solution.
   */
  if (isFileWritingLocked()) {
    return null;
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

  // Collect metadata
  const keylessHeaders = await collectKeylessMetadata()
    .then(formatMetadataHeaders)
    .catch(() => new Headers());

  const accountlessApplication = await client.__experimental_accountlessApplications
    .createAccountlessApplication({ requestHeaders: keylessHeaders })
    .catch(() => null);

  if (accountlessApplication) {
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
  }
  /**
   * Clean up locks.
   */
  unlockFileWriting();

  return accountlessApplication;
}

function removeKeyless() {
  const { rmSync } = nodeFsOrThrow();

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
