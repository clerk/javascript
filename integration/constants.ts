import * as path from 'node:path';

export const constants = {
  TMP_DIR: path.join(process.cwd(), '.temp_integration'),
  APPS_STATE_FILE: path.join(process.cwd(), '.temp_integration', 'state.json'),
} as const;
