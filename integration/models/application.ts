import * as path from 'node:path';

import treekill from 'tree-kill';

import { createLogger, fs, getPort, run, waitForIdleProcess, waitForServer } from '../scripts';
import type { ApplicationConfig } from './applicationConfig.js';
import type { EnvironmentConfig } from './environment.js';

export type Application = ReturnType<typeof application>;

export const application = (config: ApplicationConfig, appDirPath: string, appDirName: string) => {
  const { name, scripts, envWriter } = config;
  const logger = createLogger({ prefix: `${appDirName}` });
  const state = { completedSetup: false, serverUrl: '', env: {} as EnvironmentConfig };
  const cleanupFns: { (): unknown }[] = [];
  const now = Date.now();
  const stdoutFilePath = path.resolve(appDirPath, `e2e.${now}.log`);
  const stderrFilePath = path.resolve(appDirPath, `e2e.${now}.err.log`);

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

      const proc = run(scripts.dev, {
        cwd: appDirPath,
        env: { PORT: port.toString() },
        detached: opts.detached,
        stdout: opts.detached ? fs.openSync(stdoutFilePath, 'a') : undefined,
        stderr: opts.detached ? fs.openSync(stderrFilePath, 'a') : undefined,
        log: opts.detached ? undefined : log,
      });
      await waitForServer(serverUrl, { log, maxAttempts: Infinity });
      log(`Server started at ${serverUrl}, pid: ${proc.pid}`);
      cleanupFns.push(() => treekill(proc.pid, 'SIGKILL'));
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
      // If this is ever used as a background process, we need to make sure
      // it's not using the log function. See the dev() method above
      const proc = run(scripts.serve, { cwd: appDirPath, env: { PORT: port.toString() } });
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
