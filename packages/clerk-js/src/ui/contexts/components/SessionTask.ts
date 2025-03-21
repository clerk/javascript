import { createContext } from 'react';

import type { SessionTaskCtx } from '../../types';

export const SessionTaskContext = createContext<SessionTaskCtx | null>(null);
