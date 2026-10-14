import type { Ref } from 'react';

import type { ConfirmController } from '../../../blocks/confirm';
import type { DialogFocusTarget } from '../../../components/dialog';
import type { UserProfileEmail, UserProfileEmailVerifier } from '../user-profile-contact.types';
import type { UserProfileAddEmailController } from './user-profile-add-email.controller';

export interface UserProfileEmailSectionViewProps {
  emails: UserProfileEmail[];
  canAdd: boolean;
  verification: UserProfileAddEmailController;
  error: string | undefined;
  rowRef: Ref<HTMLDivElement>;
  registerTrigger: (id: string) => Ref<HTMLButtonElement>;
  remove?: ConfirmController<UserProfileEmail>;
  finalFocus: DialogFocusTarget;
  verificationFinalFocus: DialogFocusTarget;
  onVerify: (id: string) => void;
  onSetPrimary: (id: string) => void;
}

export type UserProfileEmailSectionModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      userId: string;
      emails: UserProfileEmail[];
      username?: string;
      onCreateEmail?: (emailAddress: string) => Promise<UserProfileEmailVerifier>;
      getEmailVerifier: (id: string) => UserProfileEmailVerifier;
      onSetPrimaryEmail: (id: string) => Promise<void>;
      onRemoveEmail?: (id: string) => Promise<void>;
    };

export type ReadyEmailSectionModel = Extract<UserProfileEmailSectionModel, { status: 'ready' }>;
