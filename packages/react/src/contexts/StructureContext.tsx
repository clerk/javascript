import React from 'react';

export interface StructureContextValue {
  guaranteedLoaded: boolean;
  guaranteedUser: boolean;
}

// TODO: alternatively, split it into a context
// per protected provider
export const StructureContextStates = Object.freeze({
  noGuarantees: Object.freeze({
    guaranteedLoaded: false,
    guaranteedUser: false,
  }),
  guaranteedLoaded: Object.freeze({
    guaranteedLoaded: true,
    guaranteedUser: false,
  }),
  guaranteedAll: Object.freeze({
    guaranteedLoaded: true,
    guaranteedUser: true,
  }),
});

export const StructureContext = React.createContext<
  StructureContextValue | undefined
>(undefined);
StructureContext.displayName = 'StructureContext';
