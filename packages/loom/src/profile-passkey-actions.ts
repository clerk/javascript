import type { ClerkSessionsHost } from './clerk';
import type { LoomClient } from './client';
import type { ProfileActions } from './profile-actions-types';
import type { ProfileEnvironment } from './profile-host-types';

export function passkeyActions(
  host: ClerkSessionsHost,
  owner: LoomClient,
  current: () => NonNullable<ClerkSessionsHost['user']>,
  environment: () => ProfileEnvironment,
  canAdd: () => boolean,
): ProfileActions['passkey'] {
  const enabled = Boolean(environment().userSettings.attributes.passkey?.enabled && canAdd());
  const user = current();
  const passkey = (id: string) => {
    const target = current().passkeys?.find(item => item.id === id);
    if (!target || !environment().userSettings.attributes.passkey?.enabled || !canAdd()) {
      throw new Error('Passkey unavailable.');
    }
    return target;
  };
  const mutate = (operation: () => Promise<unknown>) =>
    owner.mutateProfile(async () => {
      current();
      await operation();
      current();
    });
  return {
    available: enabled && Boolean(user.passkeys),
    add:
      enabled && !host.isSatellite && user.createPasskey
        ? () =>
            mutate(async () => {
              if (!canAdd() || !environment().userSettings.attributes.passkey?.enabled || host.isSatellite) {
                throw new Error('Passkey creation unavailable.');
              }
              const target = current();
              if (!target.createPasskey) {
                throw new Error('Passkey creation unavailable.');
              }
              await target.createPasskey();
            })
        : undefined,
    rename:
      enabled && user.passkeys
        ? (id, name) =>
            mutate(async () => {
              if (new TextEncoder().encode(name).length > 256) {
                throw new Error('Passkey name is too long.');
              }
              await passkey(id).update({ name });
            })
        : undefined,
    remove:
      enabled && user.passkeys
        ? id =>
            mutate(async () => {
              await passkey(id).delete();
            })
        : undefined,
  };
}
