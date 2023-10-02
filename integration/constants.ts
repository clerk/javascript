/* eslint-disable turbo/no-undeclared-env-vars */
import * as path from 'node:path';

export const constants = {
  TMP_DIR: path.join(process.cwd(), '.temp_integration'),
  APPS_STATE_FILE: path.join(process.cwd(), '.temp_integration', 'state.json'),
  APP_URL: process.env.APP_URL,
  APP_ID: process.env.APP_ID,
  CLEANUP: !(process.env.CLEANUP === '0' || process.env.CLEANUP === 'false'),
  DEBUG: process.env.DEBUG === 'true' || process.env.DEBUG === '1',
  APP_PK: process.env.APP_PK,
  APP_SK: process.env.APP_SK,
} as const;
