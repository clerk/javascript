/* eslint-disable turbo/no-undeclared-env-vars */

import os from 'node:os';
import path from 'node:path';

import { constants } from '../constants';
import { stateFile } from '../models/stateFile';
import { awaitableTreekill, fs, waitForServer } from '.';
import { run } from './run';

export const startClerkJsHttpServer = async () => {
  if (process.env.E2E_APP_CLERK_JS) {
    return;
  }
  if (!process.env.CI) {
    await copyClerkJsToTempDir();
  }
  return serveFromTempDir();
};

export const killClerkJsHttpServer = async () => {
  const clerkJsHttpServerPid = stateFile.getClerkJsHttpServerPid();
  if (clerkJsHttpServerPid) {
    console.log('Killing clerkJsHttpServer', clerkJsHttpServerPid);
    await awaitableTreekill(clerkJsHttpServerPid, 'SIGKILL');
  }
};

// If we are running the tests locally, then clerk.browser.js should be built already
// so we simply copy it from packages/clerk to the same location as CICD would install it
const copyClerkJsToTempDir = async () => {
  const clerkJsTempDir = getClerkJsTempDir();
  await fs.remove(clerkJsTempDir);
  await fs.ensureDir(clerkJsTempDir);
  const packagesClerkJsDistPath = path.join(process.cwd(), 'packages/clerk-js/dist');
  fs.copySync(packagesClerkJsDistPath, clerkJsTempDir);
};

const serveFromTempDir = async () => {
  console.log('Serving clerkJs from temp dir');
  const port = 18211;
  const serverUrl = `http://localhost:${port}`;
  const now = Date.now();
  const stdoutFilePath = path.resolve(constants.TMP_DIR, `clerkJsHttpServer.${now}.log`);
  const stderrFilePath = path.resolve(constants.TMP_DIR, `clerkJsHttpServer.${now}.err.log`);
  const clerkJsTempDir = getClerkJsTempDir();
  const proc = run(`node_modules/.bin/http-server ${clerkJsTempDir} -d --gzip --cors -a localhost`, {
    cwd: process.cwd(),
    env: { PORT: port.toString() },
    detached: true,
    stdout: fs.openSync(stdoutFilePath, 'a'),
    stderr: fs.openSync(stderrFilePath, 'a'),
  });
  stateFile.setClerkJsHttpServerPid(proc.pid);
  await waitForServer(serverUrl, { log: console.log, maxAttempts: Infinity });
  console.log('clerk.browser.js is being served from', serverUrl);
};

// The location where the clerk.browser.js is served from
// For simplicity, on CICD we install `@clerk/clerk-js` on osTemp
// so the actual clerk.browser.file is at osTemp/clerk-js/node_modules/@clerk/clerk-js/dist
// Locally, it's the osTemp/clerk-js/node_modules/@clerk/clerk-js/dist
// You can override it by setting the `E2E_APP_CLERK_JS_DIR` env variable
const getClerkJsTempDir = () => {
  const osTempDir = process.env.E2E_APP_CLERK_JS_DIR || os.tmpdir();
  return path.join(osTempDir, ...'clerk-js/node_modules/@clerk/clerk-js/dist'.split('/'));
};
