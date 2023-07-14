import * as path from 'node:path';

import treekill from 'tree-kill';

import { createLogger, fs, getPort, run, waitForIdleProcess } from '../utils';
import type { ApplicationConfig } from './applicationConfig.js';
import type { EnvironmentConfig } from './environment.js';

export type Application = ReturnType<typeof application>;

export const application = (config: ApplicationConfig, appDirPath: string, appDirName: string) => {
  const { name, scripts, envWriter } = config;
  // TODO: Revise how serverUrl is set
  // It is currently set by serve and dev
  const logger = createLogger({ prefix: `${appDirName}` });
  const state = { completedSetup: false, serverUrl: '', env: {} as EnvironmentConfig };
  const cleanupFns: { (): any }[] = [];

  const self = {
    name,
    scripts,
    appDir: appDirPath,
    get serverUrl() {
      return state.serverUrl;
    },
    get env() {
      return state.env;
    },
    withEnv: async (env: EnvironmentConfig) => {
      state.env = env;
      return envWriter(appDirPath, env);
    },
    setup: async (opts?: { strategy?: 'ci' | 'i' | 'copy'; force?: boolean }) => {
      const { force } = opts || {};
      const nodeModulesExist = await fs.pathExists(path.resolve(appDirPath, 'node_modules'));
      if (force || !nodeModulesExist) {
        const log = logger.child({ prefix: 'setup' }).info;
        await run(scripts.setup, { cwd: appDirPath, log });
        state.completedSetup = true;
      }
    },
    dev: async (opts: { port?: number; manualStart?: boolean; detached?: boolean } = {}) => {
      const log = logger.child({ prefix: 'dev' }).info;
      const port = opts.port || (await getPort());
      const serverUrl = `http://localhost:${port}`;
      log(`Will try to serve app at ${serverUrl}`);
      if (opts.manualStart) {
        // for debugging, you can start the dev server manually by cd'ing into the temp dir
        // and running the corresponding dev command
        // this allows the test to run as normally, while setup is controlled by you,
        // so you can inspect the running up outside the PW lifecycle
        state.serverUrl = serverUrl;
        return { port, serverUrl };
      }
      const proc = run(scripts.dev, { cwd: appDirPath, env: { PORT: port.toString() }, log, detached: opts.detached });
      cleanupFns.push(() => treekill(proc.pid, 'SIGKILL'));
      await waitForIdleProcess(proc);
      state.serverUrl = serverUrl;
      return { port, serverUrl, pid: proc.pid };
    },
    build: async () => {
      const log = logger.child({ prefix: 'build' }).info;
      await run(scripts.build, { cwd: appDirPath, log });
    },
    serve: async (opts: { port?: number; manualStart?: boolean } = {}) => {
      const port = opts.port || (await getPort());
      const serverUrl = `http://localhost:${port}`;
      const log = logger.child({ prefix: 'serve' }).info;
      const proc = run(scripts.serve, { cwd: appDirPath, env: { PORT: port.toString() }, log });
      cleanupFns.push(() => treekill(proc.pid, 'SIGKILL'));
      await waitForIdleProcess(proc);
      state.serverUrl = serverUrl;
      return { port, serverUrl, pid: proc };
    },
    stop: async () => {
      logger.info('Stopping...');
      await Promise.all(cleanupFns.map(fn => fn()));
      cleanupFns.splice(0, cleanupFns.length);
      state.serverUrl = '';
      return new Promise(res => setTimeout(res, 2000));
    },
    teardown: async () => {
      logger.info('Tearing down...');
      await self.stop();
      try {
        fs.rmSync(appDirPath, { recursive: true, force: true });
      } catch (e) {
        console.log(e);
      }
    },
  };
  return self;
};
