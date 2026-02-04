import { createWeb3 } from '@clerk/shared/internal/clerk-js/web3';

import { ModuleManager } from './moduleManager';

export const web3 = () => createWeb3(new ModuleManager());
