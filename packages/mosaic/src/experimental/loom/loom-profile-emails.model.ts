import type { ProfileEmailVerifier } from '@clerk/loom';
import { useSuspenseProfile } from '@clerk/loom/react';

import { useReverificationFlow } from '../../features/reverification';
import type { UserProfileEmailVerifier } from '../../features/user-profile/user-profile-contact.types';
import {
  canAddIdentifications,
  toContactAccess,
  toContacts,
} from '../../features/user-profile/user-profile-contact.utils';
import type { UserProfileAddEmailField } from '../../features/user-profile/user-profile-email-section/user-profile-add-email.controller';
import type { EmailSectionState } from '../../features/user-profile/user-profile-email-section/user-profile-email-section.types';
import { save } from '../../utils/errors';

const ADD_EMAIL_FIELDS: readonly UserProfileAddEmailField[] = ['emailAddress', 'code'];

function emailVerifier(raw: ProfileEmailVerifier): UserProfileEmailVerifier {
  return {
    start: () => {
      const verification = raw.start();
      switch (verification.method) {
        case 'code':
          return { method: 'code', sent: save(() => verification.sent, ADD_EMAIL_FIELDS) };
        case 'link':
          return {
            method: 'link',
            verified: save(() => verification.verified, ADD_EMAIL_FIELDS),
            cancel: verification.cancel,
          };
        case 'sso':
          return { method: 'sso', connect: () => save(verification.connect, ADD_EMAIL_FIELDS) };
      }
    },
    verifyCode: code => save(() => raw.verifyCode(code), ADD_EMAIL_FIELDS),
  };
}

export function useLoomProfileEmailsModel(): EmailSectionState | null {
  const { user, settings, actions } = useSuspenseProfile();
  const [removeEmail, removeReverification] = useReverificationFlow((id: string) => {
    const remove = actions.email.remove;
    if (!remove) {
      throw new Error('Email removal unavailable.');
    }
    return remove(id);
  });
  const [setPrimaryEmail, setPrimaryReverification] = useReverificationFlow((id: string) => {
    const setPrimary = actions.email.setPrimary;
    if (!setPrimary) {
      throw new Error('Email selection unavailable.');
    }
    return setPrimary(id);
  });
  const access = toContactAccess(
    {
      ...settings.emailAddress,
      used_for_first_factor: settings.emailAddress.usedForFirstFactor,
      used_for_second_factor: settings.emailAddress.usedForSecondFactor,
    },
    user.emailAddresses.length,
    canAddIdentifications(user, settings.enterpriseSsoEnabled),
  );
  if (!access.show) {
    return null;
  }
  const emails = toContacts(
    user.emailAddresses.map(email => ({
      ...email,
      verification: {
        status: email.verification?.status ?? null,
        expireAt: email.verification?.expireAt == null ? null : new Date(email.verification.expireAt),
      },
    })),
    user.primaryEmailAddressId,
    email => email.emailAddress,
  );
  if (!actions.email.available) {
    return { kind: 'snapshot', emails, eligibility: access };
  }
  const create = actions.email.create;
  return {
    kind: 'interactive',
    model: {
      status: 'ready',
      userId: user.id,
      username: user.username ?? undefined,
      emails,
      eligibility: access,
      canManageEmail: actions.email.canManageEmail,
      onCreateEmail:
        access.canCreate && create
          ? async address => {
              const request = create(address);
              await save(() => request, ADD_EMAIL_FIELDS);
              return emailVerifier(await request);
            }
          : undefined,
      getEmailVerifier: id => emailVerifier(actions.email.verifier(id)),
      onSetPrimaryEmail: id => save(() => setPrimaryEmail(id)),
      onRemoveEmail: access.canRemove && actions.email.remove ? id => save(() => removeEmail(id)) : undefined,
      removeReverification,
      setPrimaryReverification,
    },
  };
}
