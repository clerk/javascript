import { formatRelative } from '@clerk/shared/date';
import { useClerk, useSession, useUser } from '@clerk/shared/react';
import type { EnvironmentResource, PasskeyResource, UserResource } from '@clerk/shared/types';

import { getMosaicEnvironment, useMosaicEnvironment } from '../../../hooks/use-mosaic-environment';
import { useNow } from '../../../hooks/use-now';
import { fill, useLocale, useMessages } from '../../../localization';
import { allowsIdentificationCreation } from '../../../utils/allows-identification-creation';
import { MosaicError } from '../../../utils/errors';
import type { ClerkCall } from '../../clerk/errors';
import { callClerk } from '../../clerk/errors';
import type { ReverificationController } from '../../reverification';
import { useReverificationFlow } from '../../reverification';
import type {
  UserProfilePasskey,
  UserProfilePasskeyNameValidator,
  UserProfileRenamePasskeyValues,
} from './user-profile-passkeys-section.types';

const RENAME_FIELDS: readonly (keyof UserProfileRenamePasskeyValues)[] = ['name'];

type Passkey = Pick<PasskeyResource, 'id' | 'name' | 'createdAt' | 'lastUsedAt'>;

export type PasskeysProjection =
  | { status: 'hidden' }
  | {
      status: 'ready';
      passkeys: { id: string; name: string; createdAt: Date; lastUsedAt: Date | null }[];
      canAdd: boolean;
    };

export function projectPasskeys({
  passkeys,
  enabled,
  allowIdentificationCreation,
  isSatellite,
}: {
  passkeys: readonly Passkey[];
  enabled: boolean;
  allowIdentificationCreation: boolean;
  isSatellite: boolean;
}): PasskeysProjection {
  if (!enabled || !allowIdentificationCreation) {
    return { status: 'hidden' };
  }

  return {
    status: 'ready',
    passkeys: passkeys.map(passkey => ({
      id: passkey.id,
      name: passkey.name ?? '',
      createdAt: passkey.createdAt,
      lastUsedAt: passkey.lastUsedAt,
    })),
    canAdd: !isSatellite,
  };
}

export type UserProfilePasskeysModel =
  | { status: 'loading' }
  | { status: 'hidden' }
  | {
      status: 'ready';
      userId: string;
      sessionId: string;
      passkeys: UserProfilePasskey[];
      onAdd?: () => ClerkCall;
      onRename: (id: string, name: string) => ClerkCall;
      validateName: UserProfilePasskeyNameValidator;
      onRemove: (id: string) => ClerkCall;
      reverification: ReverificationController;
      addReverification: ReverificationController;
    };

function getPasskeysProjection(
  user: UserResource,
  environment: EnvironmentResource,
  isSatellite: boolean,
): PasskeysProjection {
  return projectPasskeys({
    passkeys: user.passkeys,
    enabled: Boolean(environment.userSettings.attributes.passkey?.enabled),
    allowIdentificationCreation: allowsIdentificationCreation(user, environment.userSettings.enterpriseSSO),
    isSatellite,
  });
}

export function useUserProfilePasskeysModel(): UserProfilePasskeysModel {
  const clerk = useClerk();
  const { isLoaded: isUserLoaded, user } = useUser();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const environment = useMosaicEnvironment();
  const now = useNow({ updateInterval: 60_000 });
  const locale = useLocale();
  const messages = useMessages('userProfile').passkeys;
  const [deletePasskey, reverification] = useReverificationFlow((passkey: PasskeyResource) => passkey.delete());
  const [createPasskey, addReverification] = useReverificationFlow((current: UserResource) => current.createPasskey());
  const validateName: UserProfilePasskeyNameValidator = name =>
    new TextEncoder().encode(name).length > 256 ? { type: 'error', message: messages.nameTooLongError } : undefined;

  if (!isUserLoaded || !isSessionLoaded || !environment) {
    return { status: 'loading' };
  }
  if (!user || !session) {
    return { status: 'hidden' };
  }

  const userId = user.id;
  const sessionId = session.id;
  const projection = getPasskeysProjection(user, environment, clerk.isSatellite);
  if (projection.status === 'hidden') {
    return projection;
  }

  const currentUser = () => {
    const current = clerk.user;
    const currentEnvironment = getMosaicEnvironment(clerk);
    if (
      !current ||
      !currentEnvironment ||
      current.id !== userId ||
      clerk.session?.id !== sessionId ||
      getPasskeysProjection(current, currentEnvironment, clerk.isSatellite).status === 'hidden'
    ) {
      throw new MosaicError([{ code: 'passkey_account_unavailable', message: messages.accountUnavailableError }]);
    }
    return current;
  };

  function formatPasskeyDate(date: Date): string {
    const relative = formatRelative({ date, relativeTo: now });
    if (!relative) {
      return '';
    }
    if (relative.relativeDateCase === 'other') {
      return new Intl.DateTimeFormat(locale).format(date);
    }
    return fill(messages.dates[relative.relativeDateCase], {
      time: new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(date),
      weekday: new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date),
    });
  }

  return {
    status: 'ready',
    userId,
    sessionId,
    validateName,
    passkeys: projection.passkeys.map(passkey => ({
      id: passkey.id,
      name: passkey.name,
      createdAtLabel: fill(messages.createdAt, { date: formatPasskeyDate(passkey.createdAt) }),
      lastUsedAtLabel: passkey.lastUsedAt
        ? fill(messages.lastUsedAt, { date: formatPasskeyDate(passkey.lastUsedAt) })
        : undefined,
    })),
    onAdd: projection.canAdd
      ? () =>
          callClerk(async () => {
            const current = currentUser();
            if (clerk.isSatellite) {
              throw new MosaicError([
                { code: 'passkey_account_unavailable', message: messages.accountUnavailableError },
              ]);
            }
            await createPasskey(current);
          })
      : undefined,
    onRename: (id, name) =>
      callClerk(
        async () => {
          const passkey = currentUser().passkeys.find(candidate => candidate.id === id);
          if (!passkey) {
            throw new MosaicError([{ code: 'passkey_unavailable', message: messages.unavailableError }]);
          }
          const feedback = validateName(name);
          if (feedback) {
            throw new MosaicError([{ code: 'passkey_name_invalid', message: feedback.message, field: 'name' }]);
          }
          await passkey.update({ name });
        },
        { fields: RENAME_FIELDS },
      ),
    onRemove: id =>
      callClerk(async () => {
        const passkey = currentUser().passkeys.find(candidate => candidate.id === id);
        if (!passkey) {
          throw new MosaicError([{ code: 'passkey_unavailable', message: messages.unavailableError }]);
        }
        await deletePasskey(passkey);
      }),
    reverification,
    addReverification,
  };
}
