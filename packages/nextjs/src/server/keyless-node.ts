import type { AccountlessApplication } from '@clerk/backend';
import { logger } from '@clerk/shared/logger';

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

/**
 * The `.clerk/` is NOT safe to be commited as it may include sensitive information about a Clerk instance.
 * It may include an instance's secret key and the secret token for claiming that instance.
 */
function updateGitignore() {
  if (!nodeRuntime.fs) {
    throw "Clerk: fsModule.fs is missing. This is an internal error. Please contact Clerk's support.";
  }
  const { existsSync, writeFileSync, readFileSync, appendFileSync } = nodeRuntime.fs;

  if (!nodeRuntime.path) {
    throw "Clerk: fsModule.path is missing. This is an internal error. Please contact Clerk's support.";
  }
  const gitignorePath = nodeRuntime.path.join(process.cwd(), '.gitignore');
  if (!existsSync(gitignorePath)) {
    writeFileSync(gitignorePath, '');
  }

  // Check if `.clerk/` entry exists in .gitignore
  const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
  if (!gitignoreContent.includes(CLERK_HIDDEN + '/')) {
    appendFileSync(gitignorePath, `\n${CLERK_HIDDEN}/\n`);
  }
}

const generateHiddenPath = (...slugs: string[]) => {
  if (!nodeRuntime.path) {
    throw "Clerk: fsModule.path is missing. This is an internal error. Please contact Clerk's support.";
  }
  return nodeRuntime.path.join(process.cwd(), CLERK_HIDDEN, ...slugs);
};

const _TEMP_DIR_NAME = '.tmp';
const getKeylessConfigurationPath = () => generateHiddenPath(_TEMP_DIR_NAME, 'keyless.json');
const getKeylessReadMePath = () => generateHiddenPath(_TEMP_DIR_NAME, 'README.md');

let isCreatingFile = false;

function safeParseClerkFile(): AccountlessApplication | undefined {
  if (!nodeRuntime.fs) {
    throw "Clerk: fsModule.fs is missing. This is an internal error. Please contact Clerk's support.";
  }
  const { readFileSync } = nodeRuntime.fs;
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

const createMessage = (keys: AccountlessApplication) => {
  return `\n\x1b[35m\n[Clerk]:\x1b[0m You are running on keyless mode.\nYou can \x1b[35mclaim your keys\x1b[0m by visiting ${keys.claimUrl}\n`;
};

async function createOrReadKeyless(): Promise<AccountlessApplication | undefined> {
  if (!nodeRuntime.fs) {
    // This should never happen.
    throw "Clerk: fsModule.fs is missing. This is an internal error. Please contact Clerk's support.";
  }
  const { existsSync, writeFileSync, mkdirSync, rmSync } = nodeRuntime.fs;

  /**
   * If another request is already in the process of acquiring keys return early.
   * Using both an in-memory and file system lock seems to be the most effective solution.
   */
  if (isCreatingFile || existsSync(CLERK_LOCK)) {
    return undefined;
  }

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

  const CONFIG_PATH = getKeylessConfigurationPath();
  const README_PATH = getKeylessReadMePath();

  mkdirSync(generateHiddenPath(_TEMP_DIR_NAME), { recursive: true });
  updateGitignore();

  /**
   * When the configuration file exists, always read the keys from the file
   */
  const envVarsMap = safeParseClerkFile();
  if (envVarsMap?.publishableKey && envVarsMap?.secretKey) {
    isCreatingFile = false;
    rmSync(CLERK_LOCK, { force: true, recursive: true });

    /**
     * Notify developers.
     */
    logger.logOnce(createMessage(envVarsMap));

    return envVarsMap;
  }

  /**
   * At this step, it is safe to create new keys and store them.
   */
  const client = createClerkClientWithOptions({});
  const accountlessApplication = await client.__experimental_accountlessApplications.createAccountlessApplication();

  /**
   * Notify developers.
   */
  logger.logOnce(createMessage(accountlessApplication));

  writeFileSync(CONFIG_PATH, JSON.stringify(accountlessApplication), {
    encoding: 'utf8',
    mode: '0777',
    flag: 'w',
  });

  // TODO-KEYLESS: Add link to official documentation.
  const README_NOTIFICATION = `
## DO NOT COMMIT
This directory is auto-generated from \`@clerk/nextjs\` because you are running on Keyless mode. Avoid committing the \`.clerk/\` directory as it includes the secret key of the unclaimed instance.
  `;

  writeFileSync(README_PATH, README_NOTIFICATION, {
    encoding: 'utf8',
    mode: '0777',
    flag: 'w',
  });

  /**
   * Clean up locks.
   */
  rmSync(CLERK_LOCK, { force: true, recursive: true });
  isCreatingFile = false;

  return accountlessApplication;
}

const dotenvFiles = [`.env.development.local`, `.env.local`];

/**
 * Copy the keys from the hidden directory inside a local environment file.
 * We cannot completely remove the hidden directory yet, since there is no guarantee that the newly set
 * environment variables will be loaded on time to prevent another accountable application from being removed.
 */
function copyKeysInsideEnvFile() {
  if (!nodeRuntime.fs) {
    // This should never happen.
    throw "Clerk: fsModule.fs is missing. This is an internal error. Please contact Clerk's support.";
  }

  let existingEnvFile: string | undefined;
  const { existsSync, writeFileSync } = nodeRuntime.fs;

  for (const file of dotenvFiles) {
    const envPath = nodeRuntime.path.join(process.cwd(), file);
    if (existsSync(envPath)) {
      existingEnvFile = envPath;
      break;
    }
  }

  const keys = safeParseClerkFile();

  if (!keys) {
    return;
  }

  writeFileSync(
    existingEnvFile || nodeRuntime.path.join(process.cwd(), '.env.local'),
    `
# Your Clerk instance keys:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${keys.publishableKey}
CLERK_SECRET_KEY=${keys.secretKey}
# NOTE: You can safely remove the \`.clerk/\` directory if you like.
`,
    {
      encoding: 'utf8',
      mode: '0777',
      flag: 'a',
    },
  );
}

export { createOrReadKeyless, copyKeysInsideEnvFile };
