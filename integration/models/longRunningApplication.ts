import { parsePublishableKey } from '@clerk/shared/keys';
import { clerkSetup } from '@clerk/testing/playwright';

import { awaitableTreekill, fs } from '../scripts';
import type { Application } from './application';
import type { ApplicationConfig } from './applicationConfig';
import type { EnvironmentConfig } from './environment';
import { environmentConfig } from './environment';
import { stateFile } from './stateFile';

const getPort = (_url: string) => {
  if (!_url) {
    return undefined;
  }
  const url = new URL(_url);
  return Number.parseInt(url.port || (url.protocol === 'https:' ? '443' : '80'));
};

export type LongRunningApplication = ReturnType<typeof longRunningApplication>;
export type LongRunningApplicationParams = {
  id: string;
  config: ApplicationConfig;
  env: EnvironmentConfig;
  serverUrl?: string;
};

/**
 * A long-running app is an app that is started once and then used for all tests.
 * Its interface is the same as the Application and the ApplicationConfig interface,
 * making it interchangeable with the Application and ApplicationConfig.
 *
 * After init() is called, all mutating methods on the config are ignored.
 */
export const longRunningApplication = (params: LongRunningApplicationParams) => {
  const { id } = params;
  const name = `long-running--${params.id}`;
  const config = params.config.clone().setName(name);
  let app: Application;
  let pid: number;
  let port = getPort(params.serverUrl);
  let serverUrl: string = params.serverUrl;
  let appDir: string;
  let env: EnvironmentConfig = params.env;

  const readFromStateFile = () => {
    if (!stateFile.getLongRunningApps() || [port, serverUrl, pid, appDir, env].filter(Boolean).length === 0) {
      return;
    }
    const data = stateFile.getLongRunningApps()[id] || {};
    port ||= data.port;
    serverUrl ||= data.serverUrl;
    pid ||= data.pid;
    appDir ||= data.appDir;
    env ||= environmentConfig().fromJson(data.env);
  };

  const self = new Proxy(
    {
      // will be called by global.setup.ts and by the test runner
      // the first time this is called, the app starts and the state is persisted in the state file
      init: async () => {
        const log = (msg: string) => console.log(`[${name}] ${msg}`);
        log('Starting init...');
        try {
          const publishableKey = params.env.publicVariables.get('CLERK_PUBLISHABLE_KEY');
          const secretKey = params.env.privateVariables.get('CLERK_SECRET_KEY');
          const apiUrl = params.env.privateVariables.get('CLERK_API_URL');
          const { instanceType, frontendApi: frontendApiUrl } = parsePublishableKey(publishableKey);

          if (instanceType !== 'development') {
            log('Skipping setup of testing tokens for non-development instance');
          } else {
            log('Setting up testing tokens...');
            await clerkSetup({
              publishableKey,
              frontendApiUrl,
              secretKey,
              // @ts-expect-error apiUrl is not a typed option for clerkSetup, but it is accepted at runtime.
              apiUrl,
              dotenv: false,
            });
            log('Testing tokens setup complete');
          }
        } catch (error) {
          console.error('Error setting up testing tokens:', error);
          throw error;
        }
        try {
          log('Committing config...');
          app = await config.commit();
          log(`Config committed, appDir: ${app.appDir}`);
        } catch (error) {
          console.error('Error committing config:', error);
          throw error;
        }
        try {
          await app.withEnv(params.env);
        } catch (error) {
          console.error('Error setting up environment:', error);
          throw error;
        }
        try {
          log('Running setup (pnpm install)...');
          await app.setup();
          log('Setup complete');
        } catch (error) {
          console.error('Error during app setup:', error);
          throw error;
        }
        try {
          log('Building app...');
          const buildTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Build timed out after 120s for ${name}`)), 120_000),
          );
          await Promise.race([app.build(), buildTimeout]);
          log('Build complete');
        } catch (error) {
          console.error('Error during app build:', error);
          throw error;
        }
        try {
          log('Starting serve (detached)...');
          const serveResult = await app.serve({ detached: true });
          port = serveResult.port;
          serverUrl = serveResult.serverUrl;
          pid = serveResult.pid;
          appDir = app.appDir;
          log(`Serve complete: port=${port}, serverUrl=${serverUrl}, pid=${pid}`);
          stateFile.addLongRunningApp({ port, serverUrl, pid, id, appDir, env: params.env.toJson() });
        } catch (error) {
          console.error('Error during app serve:', error);
          throw error;
        }
      },
      // will be called by global.teardown.ts
      destroy: async () => {
        readFromStateFile();
        console.log(`Destroying ${serverUrl}`);
        await awaitableTreekill(pid, 'SIGKILL');
        // TODO: Test whether this is necessary now that we have awaitableTreekill
        await new Promise(res => setTimeout(res, 2000));
        await fs.rm(appDir, { recursive: true, force: true });
      },
      // read the persisted state and behave like an app
      commit: () => {
        if (!serverUrl) {
          readFromStateFile();
        }
      },
      dev: () => ({ port, serverUrl, pid }),
      setup: () => Promise.resolve(),
      withEnv: () => Promise.resolve(),
      teardown: () => Promise.resolve(),
      build: () => Promise.resolve(),
      get name() {
        return name;
      },
      get id() {
        return id;
      },
      get env() {
        readFromStateFile();
        return env;
      },
      get serverUrl() {
        readFromStateFile();
        return serverUrl;
      },
    },
    {
      get(target, prop: string) {
        if (!(prop in target) && prop in config) {
          return () => self;
        }
        return target[prop];
      },
    },
  );

  return self as any as Application & ApplicationConfig & typeof self;
};
