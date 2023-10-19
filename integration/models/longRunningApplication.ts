import treekill from 'tree-kill';

import { fs } from '../scripts';
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
    const data = stateFile.getLongRunningApps()[id];
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
        app = await config.commit();
        await app.withEnv(params.env);
        await app.setup();
        const { port, serverUrl, pid } = await app.dev({ detached: true });
        stateFile.addLongRunningApp({ port, serverUrl, pid, id, appDir: app.appDir, env: params.env.toJson() });
      },
      // will be called by global.teardown.ts
      destroy: async () => {
        readFromStateFile();
        console.log(`Destroying ${serverUrl}`);
        treekill(pid, 'SIGKILL');
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
      build: () => {
        throw new Error('build for long running apps is not supported yet');
      },
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

  // eslint-disable-next-line
  return self as any as Application & ApplicationConfig & typeof self;
};
