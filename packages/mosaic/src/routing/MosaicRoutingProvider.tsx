import { useClerk } from '@clerk/shared/react';
import React from 'react';

import { createHashLocation } from './hash-location';
import type { MosaicLocation } from './location';
import { createMemoryLocation } from './memory-location';
import { createPathLocation, type HostNavigate } from './path-location';

type MosaicRoutingOptions =
  | { routing: 'path'; path: string }
  | { routing: 'hash' }
  | { routing: 'memory'; initialPath?: string };

export type MosaicRoutingProviderProps = MosaicRoutingOptions & {
  children: React.ReactNode;
};

interface Routing {
  location: MosaicLocation;
  start?: () => Promise<void>;
}

const MosaicRoutingContext = React.createContext<MosaicLocation | undefined>(undefined);

function createRouting(options: MosaicRoutingOptions, navigate: HostNavigate): Routing {
  switch (options.routing) {
    case 'path': {
      const location = createPathLocation({ basePath: options.path, navigate });
      return { location, start: location.start };
    }
    case 'hash':
      return { location: createHashLocation() };
    case 'memory':
      return { location: createMemoryLocation(options.initialPath) };
  }
}

export function MosaicRoutingProvider(props: MosaicRoutingProviderProps): React.ReactElement {
  const clerk = useClerk();
  const [routing] = React.useState(() =>
    createRouting(props, async (to, { replace }) => {
      await clerk.navigate(to, { replace, metadata: { navigationType: 'internal' } });
    }),
  );

  React.useEffect(() => {
    void routing.start?.();
  }, [routing]);

  return <MosaicRoutingContext.Provider value={routing.location}>{props.children}</MosaicRoutingContext.Provider>;
}

export function useMosaicLocation(): MosaicLocation | undefined {
  return React.useContext(MosaicRoutingContext);
}
