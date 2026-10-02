import type { ReactNode } from 'react';

import type { FieldFeedback } from '../../../components/form';

export type UserProfilePasskeyNameValidator = (name: string) => FieldFeedback | undefined;

export interface UserProfileRenamePasskeyValues {
  name: string;
}

export interface UserProfilePasskey {
  id: string;
  name: string;
  createdAtLabel?: string;
  lastUsedAtLabel?: string;
}

export interface UserProfilePasskeysSlot {
  content: ReactNode;
}
