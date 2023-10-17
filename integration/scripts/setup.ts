/* eslint-disable turbo/no-undeclared-env-vars */
import { constants } from '../constants';

export const parseEnvOptions = () => {
  const appIds = constants.E2E_APP_ID ? constants.E2E_APP_ID.split(',') : [];
  const appUrl = constants.E2E_APP_URL;
  const appPk = constants.E2E_APP_PK;
  const appSk = constants.E2E_APP_SK;

  if (appIds.length && appUrl) {
    throw new Error('E2E_APP_ID cannot be used with E2E_APP_URL');
  }

  return { appIds, appUrl, appPk, appSk };
};
