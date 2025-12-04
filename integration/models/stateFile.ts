import { constants } from '../constants';
import { fs } from '../scripts';
import type { EnvironmentConfig } from './environment';

export type AppParams = {
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
  /**
   * This prop describes a running application started manually by the
   * e2e suite user by providing the E2E_APP_URL, E2E_APP_ID, E2E_APP_PK, E2E_APP_SK variables
   **/
  standaloneApp: StandaloneAppParams;
  /**
   * This prop describes all long-running apps started by the e2e suite itself
   **/
  longRunningApps: Record<string, AppParams>;
  /**
   * This prop describes the pid of the http server that serves the clerk-js hotloaded lib.
   * The http-server replaces the production clerk-js delivery mechanism.
   * The PID is used to teardown the http-server after the tests are done.
   */
  clerkJsHttpServerPid: number;
  /**
   * This prop describes the pid of the http server that serves the clerk-ui hotloaded lib.
   * The http-server replaces the production clerk-ui delivery mechanism.
   * The PID is used to teardown the http-server after the tests are done.
   */
  clerkUiHttpServerPid: number;
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

  const setClerkJsHttpServerPid = (pid: number) => {
    const json = read();
    json.clerkJsHttpServerPid = pid;
    write(json);
  };

  const getClerkJsHttpServerPid = () => {
    return read().clerkJsHttpServerPid;
  };

  const setClerkUiHttpServerPid = (pid: number) => {
    const json = read();
    json.clerkUiHttpServerPid = pid;
    write(json);
  };

  const getClerkUiHttpServerPid = () => {
    return read().clerkUiHttpServerPid;
  };

  const debug = () => {
    const json = read();
    console.log('state file', JSON.stringify(json, null, 2));
  };

  return {
    remove,
    setStandAloneApp,
    getStandAloneApp,
    setClerkJsHttpServerPid,
    getClerkJsHttpServerPid,
    setClerkUiHttpServerPid,
    getClerkUiHttpServerPid,
    addLongRunningApp,
    getLongRunningApps,
    debug,
  };
};

export const stateFile = createStateFile();
