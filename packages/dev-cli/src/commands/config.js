/* eslint-disable turbo/no-undeclared-env-vars */
import { spawn } from 'node:child_process';

import { CONFIG_FILE } from '../utils/getConfiguration.js';

/**
 * Opens the clerk-dev config file in VISUAL or EDITOR.
 */
export async function config() {
  if (process.env.VISUAL) {
    spawn(process.env.VISUAL, [CONFIG_FILE], {
      stdio: 'inherit',
      env: {
        ...process.env,
      },
    });
  } else if (process.env.EDITOR) {
    spawn(process.env.EDITOR, [CONFIG_FILE], {
      stdio: 'inherit',
      env: {
        ...process.env,
      },
    });
  } else {
    console.error(`Unable to open clerk-dev config file. Make sure the EDITOR or VISUAL environment variable is set.`);
  }
}
