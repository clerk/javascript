import { createContext, useContext } from 'react';

const DEFAUlT = 'user';
export const SubscriberTypeContext = createContext<'user' | 'org'>(DEFAUlT);

export const useSubscriberTypeContext = () => useContext(SubscriberTypeContext) || DEFAUlT;
