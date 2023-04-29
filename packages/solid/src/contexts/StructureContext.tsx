import { type ParentComponent, createContext, useContext } from 'solid-js';

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

export const StructureContext = createContext<StructureContextValue | undefined>(undefined);

// @ts-expect-error hack
StructureContext.displayName = 'StructureContext';

const useStructureContext = (): StructureContextValue => {
  const structureCtx = useContext(StructureContext);
  assertWrappedByClerkProvider(structureCtx);
  return structureCtx;
};

export const LoadedGuarantee: ParentComponent = props => {
  const structure = useStructureContext();
  if (structure.guaranteedLoaded) {
    return <>{props.children}</>;
  }
  return (
    <StructureContext.Provider value={StructureContextStates.guaranteedLoaded}>
      {props.children}
    </StructureContext.Provider>
  );
};
