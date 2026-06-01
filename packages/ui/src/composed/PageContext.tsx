import { createContext } from 'react';

type PageId = 'account' | 'security' | 'general';

export const PageContext = createContext<PageId | null>(null);
