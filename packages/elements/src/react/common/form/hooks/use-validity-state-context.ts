import * as React from 'react';

export const ValidityStateContext = React.createContext<ValidityState | undefined>(undefined);
export const useValidityStateContext = () => React.useContext(ValidityStateContext);
