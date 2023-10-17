import { constants } from '../constants';
import { fs } from '../scripts';
import type { EnvironmentConfig } from './environment';

type AppParams = {
  id: string;
  port: number;
  serverUrl: string;
  pid?: number;
  appDir: string;
  env: ReturnType<EnvironmentConfig['toJson']>;
};

type StandaloneAppParams = {
  port: number;
  serverUrl: string;
};

type StateFile = Partial<{
  standaloneApp: StandaloneAppParams;
  longRunningApps: Record<string, AppParams>;
}>;

const createStateFile = () => {
  const remove = () => {
    return fs.removeSync(constants.APPS_STATE_FILE);
  };

  const read = () => {
    fs.ensureFileSync(constants.APPS_STATE_FILE);
    const contents = fs.readJsonSync(constants.APPS_STATE_FILE, { throws: false });
    return (contents || {}) as StateFile;
  };

  const write = (json: Record<string, unknown>) => {
    fs.ensureFileSync(constants.APPS_STATE_FILE);
    fs.writeJsonSync(constants.APPS_STATE_FILE, json, { spaces: 2 });
  };

  const setStandAloneApp = (params: StandaloneAppParams) => {
    const json = read();
    json.standaloneApp = params;
    write(json);
  };

  const getStandAloneApp = () => {
    const json = read();
    return json.standaloneApp;
  };

  const addLongRunningApp = (params: AppParams) => {
    const json = read();
    json.longRunningApps = json.longRunningApps || {};
    json.longRunningApps[params.id] = params;
    write(json);
  };

  const getLongRunningApps = () => {
    const json = read();
    return json.longRunningApps;
  };

  return {
    remove,
    setStandAloneApp,
    getStandAloneApp,
    addLongRunningApp,
    getLongRunningApps,
  };
};

export const stateFile = createStateFile();
