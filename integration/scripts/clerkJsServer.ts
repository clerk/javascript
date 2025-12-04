/* eslint-disable turbo/no-undeclared-env-vars */

import path from 'node:path';

import { stateFile } from '../models/stateFile';
import { getTempDir, killHttpServer, startHttpServer } from './httpServer';

export const startClerkJsHttpServer = async (): Promise<void> => {
  if (process.env.E2E_APP_CLERK_JS) {
    return;
  }

  const clerkJsTempDir = getTempDir('clerk-js/node_modules/@clerk/clerk-js/dist', 'E2E_APP_CLERK_JS_DIR');
  const sourceDir = path.join(process.cwd(), 'packages/clerk-js/dist');

  const { pid } = await startHttpServer({
    name: 'clerkJs',
    port: 18211,
    sourceDir,
    targetTempDir: clerkJsTempDir,
    envVarOverride: 'E2E_APP_CLERK_JS',
    envVarDirOverride: 'E2E_APP_CLERK_JS_DIR',
    shouldCopyInLocal: true,
  });

  stateFile.setClerkJsHttpServerPid(pid);
};

export const killClerkJsHttpServer = async (): Promise<void> => {
  const clerkJsHttpServerPid = stateFile.getClerkJsHttpServerPid();
  if (clerkJsHttpServerPid) {
    await killHttpServer(clerkJsHttpServerPid, 'clerkJs');
  }
};
