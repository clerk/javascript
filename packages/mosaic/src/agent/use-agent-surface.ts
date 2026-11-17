import { useLatestRef } from '@floating-ui/react/utils';
import { createContext, useContext, useEffect } from 'react';

import type { Agent, AgentSurface } from './create-agent';

const AgentContext = createContext<Agent | undefined>(undefined);

export const AgentProvider = AgentContext.Provider;

export function useAgentSurface(surface: AgentSurface | undefined): void {
  const agent = useContext(AgentContext);
  const surfaceRef = useLatestRef(surface);
  useEffect(() => agent?.add(() => surfaceRef.current), [agent, surfaceRef]);
}
