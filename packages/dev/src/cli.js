import { parseArgs } from 'node:util';

import { init } from './commands/init.js';
import { install } from './commands/install.js';
import { setRoot } from './commands/set-root.js';
import { setup } from './commands/setup.js';
import { watch } from './commands/watch.js';

export default async function () {
  const {
    values: { js },
    positionals: [command],
  } = parseArgs({
    allowPositionals: true,
    options: {
      js: {
        type: 'boolean',
      },
    },
  });

  switch (command) {
    case 'init':
      await init();
      break;
    case 'set-root':
      await setRoot();
      break;
    case 'install':
      await install();
      break;
    case 'setup':
      await setup();
      break;
    case 'watch':
      await watch({ js });
      break;
    default:
      console.error('must specify a command');
  }
}
