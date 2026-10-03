import { formatRelative } from '@clerk/shared/date';
import { isClerkAPIResponseError, isClerkRuntimeError } from '@clerk/shared/error';
import { useClerk, useSession, useUser } from '@clerk/shared/react';
import type { EnvironmentResource, PasskeyResource, UserResource } from '@clerk/shared/types';

import { FormSubmitError } from '../../../components/form';
import { getMosaicEnvironment, useMosaicEnvironment } from '../../../hooks/use-mosaic-environment';
import { fill, useErrorText, useLocale, useMessages } from '../../../localization';
import type {
  UserProfilePasskey,
  UserProfilePasskeyNameValidator,
  UserProfileRenamePasskeyValues,
} from './user-profile-passkeys-section.types';

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
      onAdd?: () => Promise<void>;
      onRename: (id: string, name: string) => Promise<void>;
      validateName: UserProfilePasskeyNameValidator;
      onRemove: (id: string) => Promise<void>;
    };

function getPasskeysProjection(
  user: UserResource,
  environment: EnvironmentResource,
  isSatellite: boolean,
): PasskeysProjection {
  return projectPasskeys({
    passkeys: user.passkeys,
    enabled: Boolean(environment.userSettings.attributes.passkey?.enabled),
    allowIdentificationCreation:
      !environment.userSettings.enterpriseSSO.enabled ||
      !user.enterpriseAccounts.some(
        account => account.active && account.enterpriseConnection?.disableAdditionalIdentifications,
      ),
    isSatellite,
  });
}

export function useUserProfilePasskeysModel(): UserProfilePasskeysModel {
  const clerk = useClerk();
  const { isLoaded: isUserLoaded, user } = useUser();
  const { isLoaded: isSessionLoaded, session } = useSession();
  const environment = useMosaicEnvironment();
  const locale = useLocale();
  const messages = useMessages('userProfilePasskeys');
  const errorText = useErrorText();
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
      throw new FormSubmitError({ message: messages.accountUnavailableError });
    }
    return current;
  };

  function actionError(error: unknown): Error {
    if (isClerkAPIResponseError(error)) {
      const first = error.errors[0];
      return new Error(
        errorText({
          code: first?.code,
          paramName: first?.meta?.paramName,
          message: first?.longMessage || first?.message || messages.saveError,
        }),
      );
    }
    return new Error(
      errorText({
        code: isClerkRuntimeError(error) ? error.code : undefined,
        message: error instanceof Error && error.message ? error.message : messages.saveError,
      }),
    );
  }

  function formatPasskeyDate(date: Date): string {
    const relative = formatRelative({ date, relativeTo: new Date() });
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
      ? async () => {
          const current = currentUser();
          if (clerk.isSatellite) {
            throw new Error(messages.accountUnavailableError);
          }
          try {
            await current.createPasskey();
          } catch (error) {
            throw actionError(error);
          }
        }
      : undefined,
    onRename: async (id, name) => {
      const passkey = currentUser().passkeys.find(candidate => candidate.id === id);
      if (!passkey) {
        throw new FormSubmitError({ message: messages.unavailableError });
      }
      const feedback = validateName(name);
      if (feedback) {
        throw new FormSubmitError<UserProfileRenamePasskeyValues>({ fields: { name: feedback.message } });
      }
      try {
        await passkey.update({ name });
      } catch (error) {
        if (!isClerkAPIResponseError(error)) {
          throw new FormSubmitError({ message: actionError(error).message });
        }
        const fields: { name?: string } = {};
        let message: string | undefined;
        for (const item of error.errors) {
          const text = errorText({
            code: item.code,
            paramName: item.meta?.paramName,
            message: item.longMessage || item.message || messages.saveError,
          });
          if (item.meta?.paramName === 'name') {
            fields.name ??= text;
          } else {
            message ??= text;
          }
        }
        throw new FormSubmitError<UserProfileRenamePasskeyValues>({ message, fields });
      }
    },
    onRemove: async id => {
      const passkey = currentUser().passkeys.find(candidate => candidate.id === id);
      if (!passkey) {
        throw new Error(messages.unavailableError);
      }
      try {
        await passkey.delete();
      } catch (error) {
        throw actionError(error);
      }
    },
  };
}
