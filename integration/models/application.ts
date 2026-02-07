import * as path from 'node:path';

import { parsePublishableKey } from '@clerk/shared/keys';
import { clerkSetup } from '@clerk/testing/playwright';

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
  const { name, scripts, envWriter, copyKeylessToEnv } = config;
  const logger = createLogger({ prefix: `${appDirName}` });
  const state = { completedSetup: false, serverUrl: '', env: {} as EnvironmentConfig, lastDevPort: 0 };
  const cleanupFns: { (): unknown }[] = [];
  const now = Date.now();
  const stdoutFilePath = path.resolve(appDirPath, `e2e.${now}.log`);
  const stderrFilePath = path.resolve(appDirPath, `e2e.${now}.err.log`);
  let buildOutput = '';
  let serveOutput = '';

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
    keylessToEnv: async () => {
      return copyKeylessToEnv(appDirPath);
    },
    setup: async (opts?: { strategy?: 'ci' | 'i' | 'copy'; force?: boolean }) => {
      const { force } = opts || {};
      const nodeModulesExist = await fs.pathExists(path.resolve(appDirPath, 'node_modules'));
      if (force || !nodeModulesExist) {
        const log = logger.child({ prefix: 'setup' }).info;
        await run(scripts.setup, { cwd: appDirPath, log });
        state.completedSetup = true;
        // Print all Clerk package versions (direct and transitive)
        const clerkPackagesLog = logger.child({ prefix: 'clerk-packages' }).info;
        clerkPackagesLog('Installed @clerk/* packages:');
        await run('pnpm list @clerk/* --depth 100', { cwd: appDirPath, log: clerkPackagesLog });
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

      // Setup Clerk testing tokens after the server is running
      if (state.env) {
        try {
          const publishableKey = state.env.publicVariables.get('CLERK_PUBLISHABLE_KEY');
          const secretKey = state.env.privateVariables.get('CLERK_SECRET_KEY');
          const apiUrl = state.env.privateVariables.get('CLERK_API_URL');

          if (publishableKey && secretKey) {
            const { instanceType, frontendApi: frontendApiUrl } = parsePublishableKey(publishableKey);

            if (instanceType !== 'development') {
              log('Skipping clerkSetup for non-development instance');
            } else {
              await clerkSetup({
                publishableKey,
                frontendApiUrl,
                secretKey,
                // @ts-expect-error apiUrl is not a typed option for clerkSetup, but it is accepted at runtime.
                apiUrl,
                dotenv: false,
              });
              log('Clerk testing tokens setup complete');
            }
          }
        } catch (error) {
          logger.warn('Failed to setup Clerk testing tokens:', error);
        }
      }

      state.lastDevPort = port;
      return { port, serverUrl: runtimeServerUrl, pid: proc.pid };
    },
    restart: async () => {
      const log = logger.child({ prefix: 'restart' }).info;
      log('Restarting dev server...');
      await self.stop();
      return self.dev({ port: state.lastDevPort });
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
    get serveOutput() {
      return serveOutput;
    },
    serve: async (opts: { port?: number; manualStart?: boolean; detached?: boolean; serverUrl?: string } = {}) => {
      const log = logger.child({ prefix: 'serve' }).info;
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
        state.serverUrl = runtimeServerUrl;
        return { port, serverUrl: runtimeServerUrl };
      }

      const proc = run(scripts.serve, {
        cwd: appDirPath,
        env: { PORT: port.toString() },
        detached: opts.detached,
        stdout: opts.detached ? fs.openSync(stdoutFilePath, 'a') : undefined,
        stderr: opts.detached ? fs.openSync(stderrFilePath, 'a') : undefined,
        log: opts.detached
          ? undefined
          : (msg: string) => {
              serveOutput += `\n${msg}`;
              log(msg);
            },
      });

      if (opts.detached) {
        const shouldExit = () => !!proc.exitCode && proc.exitCode !== 0;
        await waitForServer(runtimeServerUrl, { log, maxAttempts: Infinity, shouldExit });
      } else {
        await waitForIdleProcess(proc);
      }

      log(`Server started at ${runtimeServerUrl}, pid: ${proc.pid}`);
      cleanupFns.push(() => awaitableTreekill(proc.pid, 'SIGKILL'));
      state.serverUrl = runtimeServerUrl;
      return { port, serverUrl: runtimeServerUrl, pid: proc.pid };
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
