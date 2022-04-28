import React from 'react';

import { assertWrappedByClerkProvider } from './assertHelpers';

export interface StructureContextValue {
  guaranteedLoaded: boolean;
}

export const StructureContextStates = Object.freeze({
  noGuarantees: Object.freeze({
    guaranteedLoaded: false,
  }),
  guaranteedLoaded: Object.freeze({
    guaranteedLoaded: true,
  }),
});

export const StructureContext = React.createContext<StructureContextValue | undefined>(undefined);

StructureContext.displayName = 'StructureContext';

const useStructureContext = (): StructureContextValue => {
  const structureCtx = React.useContext(StructureContext);
  assertWrappedByClerkProvider(structureCtx);
  return structureCtx;
};

export const LoadedGuarantee: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const structure = useStructureContext();
  if (structure.guaranteedLoaded) {
    return <>{children}</>;
  }
  return (
    <StructureContext.Provider value={StructureContextStates.guaranteedLoaded}>{children}</StructureContext.Provider>
  );
};
