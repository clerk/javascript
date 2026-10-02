import type { ReactNode } from 'react';

export interface UserProfilePasskey {
  id: string;
  name: string;
  createdAtLabel?: string;
  lastUsedAtLabel?: string;
}

export interface UserProfilePasskeysSlot {
  content: ReactNode;
}
