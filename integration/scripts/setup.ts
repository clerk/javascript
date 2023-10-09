/* eslint-disable turbo/no-undeclared-env-vars */
import { constants } from '../constants';

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
