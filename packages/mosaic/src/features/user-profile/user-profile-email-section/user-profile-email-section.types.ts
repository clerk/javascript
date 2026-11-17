import type { Ref } from 'react';

import type { ConfirmController } from '../../../blocks/confirm';
import type { DialogFocusTarget } from '../../../components/dialog';
import type { ClerkCall } from '../../clerk/errors';
import type { ReverificationController } from '../../reverification';
import type { UserProfileContactRow, UserProfileEmail, UserProfileEmailVerifier } from '../user-profile-contact.types';
import type { UserProfileAddEmailController } from './user-profile-add-email.controller';

export interface UserProfileEmailSectionViewProps {
  emails: UserProfileContactRow[];
  canAdd: boolean;
  isDisabled: boolean;
  verification: UserProfileAddEmailController;
  error: string | undefined;
  rowRef: Ref<HTMLDivElement>;
  registerTrigger: (id: string) => Ref<HTMLButtonElement>;
  remove?: ConfirmController<UserProfileEmail>;
  finalFocus: DialogFocusTarget;
  verificationFinalFocus: DialogFocusTarget;
  setPrimaryReverification: ReverificationController;
  setPrimaryFinalFocus: DialogFocusTarget;
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
      onCreateEmail?: (emailAddress: string) => ClerkCall<UserProfileEmailVerifier>;
      getEmailVerifier: (id: string) => UserProfileEmailVerifier;
      onSetPrimaryEmail: (id: string) => ClerkCall;
      onRemoveEmail?: (id: string) => ClerkCall;
      removeReverification: ReverificationController;
      setPrimaryReverification: ReverificationController;
      createReverification: ReverificationController;
    };

export type ReadyEmailSectionModel = Extract<UserProfileEmailSectionModel, { status: 'ready' }>;
