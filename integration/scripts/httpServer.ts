/* eslint-disable turbo/no-undeclared-env-vars */

import os from 'node:os';
import path from 'node:path';

import { constants } from '../constants';
import { awaitableTreekill, fs, waitForServer } from '.';
import { run } from './run';

type HttpServerConfig = {
  name: string;
  port: number;
  sourceDir: string;
  targetTempDir: string;
  envVarOverride?: string;
  envVarDirOverride?: string;
  shouldCopyInLocal: boolean;
};

const copyToTempDir = async (sourceDir: string, targetTempDir: string): Promise<void> => {
  await fs.remove(targetTempDir);
  await fs.ensureDir(targetTempDir);
  fs.copySync(sourceDir, targetTempDir);
};

const serveFromTempDir = async (config: HttpServerConfig): Promise<{ pid: number; serverUrl: string }> => {
  console.log(`Serving ${config.name} from temp dir`);
  const serverUrl = `http://localhost:${config.port}`;
  const now = Date.now();
  const stdoutFilePath = path.resolve(constants.TMP_DIR, `${config.name}HttpServer.${now}.log`);
  const stderrFilePath = path.resolve(constants.TMP_DIR, `${config.name}HttpServer.${now}.err.log`);

  const proc = run(`node_modules/.bin/http-server ${config.targetTempDir} -d --gzip --cors -a localhost`, {
    cwd: process.cwd(),
    env: { PORT: config.port.toString() },
    detached: true,
    stdout: fs.openSync(stdoutFilePath, 'a'),
    stderr: fs.openSync(stderrFilePath, 'a'),
  });

  await waitForServer(serverUrl, { log: console.log, maxAttempts: Infinity });
  console.log(`${config.name} is being served from`, serverUrl);

  return { pid: proc.pid, serverUrl };
};

export const startHttpServer = async (config: HttpServerConfig): Promise<{ pid: number; serverUrl: string }> => {
  // Skip if override env var is provided
  if (config.envVarOverride && process.env[config.envVarOverride]) {
    return { pid: 0, serverUrl: process.env[config.envVarOverride] };
  }

  // In local development, copy files to temp directory
  if (!process.env.CI && config.shouldCopyInLocal) {
    await copyToTempDir(config.sourceDir, config.targetTempDir);
  }

  return serveFromTempDir(config);
};

export const killHttpServer = async (pid: number, serverName: string): Promise<void> => {
  if (pid) {
    console.log(`Killing ${serverName}HttpServer`, pid);
    await awaitableTreekill(pid, 'SIGKILL');
  }
};

export const getTempDir = (basePath: string, envVarOverride?: string): string => {
  const osTempDir = envVarOverride && process.env[envVarOverride] ? process.env[envVarOverride] : os.tmpdir();
  return path.join(osTempDir, ...basePath.split('/'));
};
