import { createLoadZxcvbn } from '@clerk/shared/internal/clerk-js/passwords/loadZxcvbn';

import { ModuleManager } from './moduleManager';

export const loadZxcvbn = () => {
  return createLoadZxcvbn(new ModuleManager()).loadZxcvbn;
};
