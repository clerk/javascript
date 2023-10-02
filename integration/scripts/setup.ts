/* eslint-disable turbo/no-undeclared-env-vars */
import { constants } from '../constants';
import type { LongRunningApplication } from '../models/longRunningApplication';
import { appConfigs } from '../presets';

export const parseEnvOptions = () => {
  const appIds = constants.APP_ID ? constants.APP_ID.split(',') : [];
  const appUrl = constants.APP_URL;
  const appPk = constants.APP_PK;
  const appSk = constants.APP_SK;

  if (appIds.length && appUrl) {
    throw new Error('APP_ID cannot be used with APP_URL');
  }

  return { appIds, appUrl, appPk, appSk };
};

export const getLongRunningAppsById = (ids: string[]): LongRunningApplication[] => {
  return ids.map(id => {
    const app = appConfigs.longRunning.getById(id);
    if (!app || !app.init) {
      const availableIds = Object.keys(appConfigs.longRunning).join(', ');
      throw new Error(`Could not find long running app with id ${id}. The available ids are: ${availableIds}`);
    }

    return app;
  });
};
