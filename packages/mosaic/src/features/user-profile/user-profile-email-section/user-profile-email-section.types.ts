import type { Ref } from 'react';

import type { ConfirmController } from '../../../blocks/confirm';
import type { DialogFocusTarget } from '../../../components/dialog';
import type { ReverificationController } from '../../reverification';
import type { UserProfileEmail, UserProfileEmailVerifier } from '../user-profile-contact.types';
import type { UserProfileContactAccess } from '../user-profile-contact.utils';
import type { UserProfileAddEmailController } from './user-profile-add-email.controller';

export interface UserProfileEmailSectionViewProps {
  canManageEmail?: (id: string) => boolean;
  emails: UserProfileEmail[];
  canAdd: boolean;
  eligibility?: Pick<UserProfileContactAccess, 'canCreate' | 'canRemove'>;
  verification: UserProfileAddEmailController;
  error: string | undefined;
  rowRef: Ref<HTMLDivElement>;
  registerTrigger: (id: string) => Ref<HTMLButtonElement>;
  remove?: ConfirmController<UserProfileEmail>;
  finalFocus: DialogFocusTarget;
  verificationFinalFocus: DialogFocusTarget;
  setPrimaryReverification: ReverificationController;
  setPrimaryFinalFocus: DialogFocusTarget;
  pendingPrimaryId?: string;
  pendingVerifyId?: string;
  onVerify: (id: string) => void;
  onSetPrimary: (id: string) => void;
}

export type UserProfileEmailSectionModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      userId: string;
      canManageEmail?: (id: string) => boolean;
      emails: UserProfileEmail[];
      eligibility?: Pick<UserProfileContactAccess, 'canCreate' | 'canRemove'>;
      username?: string;
      onCreateEmail?: (emailAddress: string) => Promise<UserProfileEmailVerifier>;
      getEmailVerifier: (id: string) => UserProfileEmailVerifier;
      onSetPrimaryEmail: (id: string) => Promise<void>;
      onRemoveEmail?: (id: string) => Promise<void>;
      removeReverification: ReverificationController;
      setPrimaryReverification: ReverificationController;
    };

export type ReadyEmailSectionModel = Extract<UserProfileEmailSectionModel, { status: 'ready' }>;

export type EmailSectionState =
  | {
      kind: 'snapshot';
      emails: UserProfileEmail[];
      eligibility: Pick<UserProfileContactAccess, 'canCreate' | 'canRemove'>;
    }
  | { kind: 'interactive'; model: ReadyEmailSectionModel };
