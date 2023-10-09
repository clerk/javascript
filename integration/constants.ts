/* eslint-disable turbo/no-undeclared-env-vars */
import * as path from 'node:path';

export const constants = {
  TMP_DIR: path.join(process.cwd(), '.temp_integration'),
  APPS_STATE_FILE: path.join(process.cwd(), '.temp_integration', 'state.json'),
  E2E_APP_URL: process.env.E2E_APP_URL,
  E2E_APP_ID: process.env.E2E_APP_ID,
  CLEANUP: !(process.env.CLEANUP === '0' || process.env.CLEANUP === 'false'),
  DEBUG: process.env.DEBUG === 'true' || process.env.DEBUG === '1',
  E2E_APP_PK: process.env.E2E_APP_PK,
  E2E_APP_SK: process.env.E2E_APP_SK,
} as const;
