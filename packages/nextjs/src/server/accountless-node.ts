import type { AccountlessApplication } from '@clerk/backend';

// @ts-ignore
import fsModule from '#fs';

import { createClerkClientWithOptions } from './createClerkClient';

const CLERK_HIDDEN = '.clerk';

function updateGitignore() {
  if (!fsModule.fs) {
    throw "Clerk: fsModule.fs is missing. This is an internal error. Please contact Clerk's support.";
  }
  const { existsSync, writeFileSync, readFileSync, appendFileSync } = fsModule.fs;

  if (!fsModule.path) {
    throw "Clerk: fsModule.path is missing. This is an internal error. Please contact Clerk's support.";
  }
  const gitignorePath = fsModule.path.join(process.cwd(), '.gitignore');
  if (!existsSync(gitignorePath)) {
    writeFileSync(gitignorePath, '');
  }

  // Check if `.clerk/` entry exists in .gitignore
  const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
  if (!gitignoreContent.includes(CLERK_HIDDEN + '/')) {
    appendFileSync(gitignorePath, `\n${CLERK_HIDDEN}/\n`);
  }
}

const CLERK_LOCK = 'clerk.lock';
const getClerkPath = () => {
  if (!fsModule.path) {
    throw "Clerk: fsModule.path is missing. This is an internal error. Please contact Clerk's support.";
  }
  return fsModule.path.join(process.cwd(), '.clerk', '.tmp', 'accountless.json');
};

let isCreatingFile = false;

function safeParseClerkFile(): AccountlessApplication | undefined {
  if (!fsModule.fs) {
    throw "Clerk: fsModule.fs is missing. This is an internal error. Please contact Clerk's support.";
  }
  const { readFileSync } = fsModule.fs;
  try {
    const CLERK_PATH = getClerkPath();
    let fileAsString;
    try {
      fileAsString = readFileSync(CLERK_PATH, { encoding: 'utf-8' }) || '{}';
    } catch {
      fileAsString = '{}';
    }
    return JSON.parse(fileAsString) as AccountlessApplication;
  } catch {
    return undefined;
  }
}

async function createAccountlessKeys(): Promise<AccountlessApplication | undefined> {
  if (!fsModule.fs) {
    throw "Clerk: fsModule.fs is missing. This is an internal error. Please contact Clerk's support.";
  }
  const { existsSync, writeFileSync, mkdirSync, rmSync } = fsModule.fs;
  if (isCreatingFile) {
    return undefined;
  }

  if (existsSync(CLERK_LOCK)) {
    return undefined;
  }

  isCreatingFile = true;

  writeFileSync(CLERK_LOCK, 'You can delete this file.', {
    encoding: 'utf8',
    mode: '0777',
    flag: 'w',
  });

  const CLERK_PATH = getClerkPath();

  mkdirSync(fsModule.path ? fsModule.path.dirname(CLERK_PATH) : '', { recursive: true });
  updateGitignore();

  const envVarsMap = safeParseClerkFile();

  if (envVarsMap?.publishableKey && envVarsMap?.secretKey) {
    isCreatingFile = false;
    rmSync(CLERK_LOCK, { force: true, recursive: true });
    return envVarsMap;
  }

  /**
   * Maybe the server has not restarted yet
   */

  const client = createClerkClientWithOptions({});

  const accountlessApplication = await client.__experimental_accountlessApplications.createAccountlessApplication();

  console.log('--- new keys', accountlessApplication);

  writeFileSync(CLERK_PATH, JSON.stringify(accountlessApplication), {
    encoding: 'utf8',
    mode: '0777',
    flag: 'w',
  });

  rmSync(CLERK_LOCK, { force: true, recursive: true });

  isCreatingFile = false;
  return accountlessApplication;
}

export { createAccountlessKeys };
