import { createLoadRRWebCloud } from '@clerk/shared/internal/clerk-js/sessionReplay/loadRRWebCloud';

import { ModuleManager } from './moduleManager';

export const loadRRWebCloud = () => {
  return createLoadRRWebCloud(new ModuleManager()).loadRRWebCloud;
};
