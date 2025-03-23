import { createContext } from 'react';

import type { SessionTasksCtx } from '../../types';

export const SessionTasksContext = createContext<SessionTasksCtx | null>(null);
