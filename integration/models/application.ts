import * as path from 'node:path';

import { awaitableTreekill, createLogger, fs, getPort, run, waitForIdleProcess, waitForServer } from '../scripts';
import type { ApplicationConfig } from './applicationConfig.js';
import type { EnvironmentConfig } from './environment.js';

export type Application = ReturnType<typeof application>;

export const application = (
  config: ApplicationConfig,
  appDirPath: string,
  appDirName: string,
  serverUrl: string | undefined,
) => {
  const { name, scripts, envWriter } = config;
  const logger = createLogger({ prefix: `${appDirName}` });
  const state = { completedSetup: false, serverUrl: '', env: {} as EnvironmentConfig };
  const cleanupFns: { (): unknown }[] = [];
  const now = Date.now();
  const stdoutFilePath = path.resolve(appDirPath, `e2e.${now}.log`);
  const stderrFilePath = path.resolve(appDirPath, `e2e.${now}.err.log`);
  let buildOutput = '';

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
    dev: async (opts: { port?: number; manualStart?: boolean; detached?: boolean; serverUrl?: string } = {}) => {
      const log = logger.child({ prefix: 'dev' }).info;
      const port = opts.port || (await getPort());
      const getServerUrl = () => {
        if (opts.serverUrl) {
          return opts.serverUrl.includes(':') ? opts.serverUrl : `${opts.serverUrl}:${port}`;
        }
        return serverUrl || `http://localhost:${port}`;
      };
      const runtimeServerUrl = getServerUrl();
      log(`Will try to serve app at ${runtimeServerUrl}`);
      if (opts.manualStart) {
        // for debugging, you can start the dev server manually by cd'ing into the temp dir
        // and running the corresponding dev command
        // this allows the test to run as normally, while setup is controlled by you,
        // so you can inspect the running up outside the PW lifecycle
        state.serverUrl = runtimeServerUrl;
        return { port, serverUrl: runtimeServerUrl };
      }

      const proc = run(scripts.dev, {
        cwd: appDirPath,
        env: { PORT: port.toString() },
        detached: opts.detached,
        stdout: opts.detached ? fs.openSync(stdoutFilePath, 'a') : undefined,
        stderr: opts.detached ? fs.openSync(stderrFilePath, 'a') : undefined,
        log: opts.detached ? undefined : log,
      });

      const shouldExit = () => !!proc.exitCode && proc.exitCode !== 0;
      await waitForServer(runtimeServerUrl, { log, maxAttempts: Infinity, shouldExit });
      log(`Server started at ${runtimeServerUrl}, pid: ${proc.pid}`);
      cleanupFns.push(() => awaitableTreekill(proc.pid, 'SIGKILL'));
      state.serverUrl = runtimeServerUrl;
      return { port, serverUrl: runtimeServerUrl, pid: proc.pid };
    },
    build: async () => {
      const log = logger.child({ prefix: 'build' }).info;
      await run(scripts.build, {
        cwd: appDirPath,
        log: (msg: string) => {
          buildOutput += `\n${msg}`;
          log(msg);
        },
      });
    },
    get buildOutput() {
      return buildOutput;
    },
    serve: async (opts: { port?: number; manualStart?: boolean } = {}) => {
      const port = opts.port || (await getPort());
      // TODO: get serverUrl as in dev()
      const serverUrl = `http://localhost:${port}`;
      // If this is ever used as a background process, we need to make sure
      // it's not using the log function. See the dev() method above
      const proc = run(scripts.serve, {
        cwd: appDirPath,
        env: { PORT: port.toString() },
      });
      cleanupFns.push(() => awaitableTreekill(proc.pid, 'SIGKILL'));
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
