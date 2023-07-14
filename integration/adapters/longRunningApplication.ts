import treekill from 'tree-kill';

import { constants } from '../constants';
import { fs } from '../utils';
import type { Application } from './application';
import type { ApplicationConfig } from './applicationConfig';
import type { EnvironmentConfig } from './environment';
import { environmentConfig } from './environment';

export type AppStateFile = {
  longRunningApps: Record<
    string,
    { port: number; serverUrl: string; pid: number; appDir: string; env: ReturnType<EnvironmentConfig['toJson']> }
  >;
};

export type LongRunningApplication = ReturnType<typeof longRunningApplication>;

/**
 * A long-running app is an app that is started once and then used for all tests.
 * Its interface is the same as the Application and the ApplicationConfig interface,
 * making it interchangeable with the Application and ApplicationConfig.
 *
 * After init() is called, all mutating methods on the config are ignored.
 */
export const longRunningApplication = (_name: string, _config: ApplicationConfig, _env: EnvironmentConfig) => {
  const name = `${_config.name}--long-running--${_name}`;
  const config = _config.clone().setName(name);
  let app: Application;
  let pid: number;
  let port: number;
  let serverUrl: string;
  let appDir: string;
  let env: EnvironmentConfig;

  const stateFileExists = () => {
    return fs.pathExists(constants.APPS_STATE_FILE);
  };

  const readFromStateFile = async () => {
    const json = (await fs.readJSON(constants.APPS_STATE_FILE)) as AppStateFile;
    const data = json.longRunningApps[name];
    port = data.port;
    serverUrl = data.serverUrl;
    pid = data.pid;
    appDir = data.appDir;
    env = environmentConfig().fromJson(data.env);
  };

  const self = new Proxy(
    {
      // will be called by global.setup.ts
      init: async () => {
        app = await config.commit();
        await app.withEnv(_env);
        await app.setup();
        const res = await app.dev({ detached: true });
        return { ...res, appDir: app.appDir, env: _env.toJson() };
      },
      // will be called by global.teardown.ts
      destroy: async () => {
        if (!(await stateFileExists())) {
          return;
        }
        await readFromStateFile();
        console.log(`Destroying ${serverUrl}`);
        treekill(pid, 'SIGKILL');
        await new Promise(res => setTimeout(res, 2000));
        await fs.rm(appDir, { recursive: true, force: true });
      },
      // read the persisted state and behave like an app
      commit: async () => {
        if (!serverUrl) {
          await readFromStateFile();
        }
        return Promise.resolve(self);
      },
      dev: () => ({ port, serverUrl, pid }),
      setup: () => Promise.resolve(),
      withEnv: () => Promise.resolve(),
      teardown: () => Promise.resolve(),
      build: () => {
        throw new Error('build for long running apps is not supported yet');
      },
      get name() {
        return name;
      },
      get env() {
        return env;
      },
      get serverUrl() {
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

  // eslint-disable-next-line
  return self as any as Application & ApplicationConfig & typeof self;
};
