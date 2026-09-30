import React from 'react';

import type { UserProfileModalConfig } from '../features/user-profile/user-profile.modal.types';

export interface MosaicModalDefaults {
  userProfile?: UserProfileModalConfig;
}

export interface ModalRegistry {
  add: (id: string, slot: React.ReactElement) => void;
  subscribe: (listener: () => void) => () => void;
  getSlots: () => ReadonlyMap<string, React.ReactElement>;
}

function createModalRegistry(): ModalRegistry {
  let slots: ReadonlyMap<string, React.ReactElement> = new Map();
  const listeners = new Set<() => void>();

  return {
    add(id, slot) {
      if (slots.has(id)) {
        return;
      }
      slots = new Map(slots).set(id, slot);
      listeners.forEach(listener => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSlots: () => slots,
  };
}

export const ModalRegistryContext = React.createContext<ModalRegistry | null>(null);

export const ModalDefaultsContext = React.createContext<MosaicModalDefaults>({});

export function ModalHost({
  defaults,
  children,
}: {
  defaults: MosaicModalDefaults;
  children: React.ReactNode;
}): React.ReactElement {
  const registry = React.useMemo(createModalRegistry, []);
  const slots = React.useSyncExternalStore(registry.subscribe, registry.getSlots, registry.getSlots);

  return (
    <ModalRegistryContext.Provider value={registry}>
      <ModalDefaultsContext.Provider value={defaults}>
        {children}
        {Array.from(slots, ([id, slot]) => (
          <React.Fragment key={id}>{slot}</React.Fragment>
        ))}
      </ModalDefaultsContext.Provider>
    </ModalRegistryContext.Provider>
  );
}
