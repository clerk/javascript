/* eslint-disable turbo/no-undeclared-env-vars */

import path from 'node:path';

import { stateFile } from '../models/stateFile';
import { getTempDir, killHttpServer, startHttpServer } from './httpServer';

export const startClerkUiHttpServer = async (): Promise<void> => {
  if (process.env.E2E_APP_CLERK_UI) {
    return;
  }

  const clerkUiTempDir = getTempDir('clerk-ui/node_modules/@clerk/ui/dist', 'E2E_APP_CLERK_UI_DIR');
  const sourceDir = path.join(process.cwd(), 'packages/ui/dist');

  const { pid } = await startHttpServer({
    name: 'clerkUi',
    port: 18212,
    sourceDir,
    targetTempDir: clerkUiTempDir,
    envVarOverride: 'E2E_APP_CLERK_UI',
    envVarDirOverride: 'E2E_APP_CLERK_UI_DIR',
    shouldCopyInLocal: true,
  });

  stateFile.setClerkUiHttpServerPid(pid);
};

export const killClerkUiHttpServer = async (): Promise<void> => {
  const clerkUiHttpServerPid = stateFile.getClerkUiHttpServerPid();
  if (clerkUiHttpServerPid) {
    await killHttpServer(clerkUiHttpServerPid, 'clerkUi');
  }
};
