import type { ClerkSessionsHost } from './clerk';
import type { LoomClient } from './client';
import type { ProfileActions, ProfilePhoneVerifier } from './profile-actions-types';
import type { ProfileEnvironment } from './profile-host-types';

type CurrentUser = () => NonNullable<ClerkSessionsHost['user']>;

export function phoneActions(
  owner: LoomClient,
  current: CurrentUser,
  environment: () => ProfileEnvironment,
  canAdd: () => boolean,
  defaultCountry?: string | null,
): ProfileActions['phone'] {
  const access = () => {
    const attribute = environment().userSettings.attributes.phone_number;
    const available = Boolean(
      attribute && (attribute.enabled || attribute.used_for_first_factor || attribute.used_for_second_factor),
    );
    return { available, mutable: available && !attribute?.immutable };
  };
  const user = current();
  const { available, mutable } = access();
  const phone = (id: string) => {
    const target = current().phoneNumbers?.find(item => item.id === id);
    if (!target) {
      throw new Error('Phone unavailable.');
    }
    return target;
  };
  const mutate = (operation: () => Promise<unknown>) =>
    owner.mutateProfile(async () => {
      current();
      await operation();
      current();
    });
  const verifier = (id: string): ProfilePhoneVerifier => ({
    sendCode: () =>
      mutate(async () => {
        await phone(id).prepareVerification();
        phone(id);
      }),
    verifyCode: code =>
      mutate(async () => {
        await phone(id).attemptVerification({ code });
        phone(id);
      }),
  });
  return {
    available: available && Boolean(user.phoneNumbers),
    defaultCountry: defaultCountry ?? undefined,
    verifier,
    create:
      mutable && canAdd() && user.createPhoneNumber
        ? async number => {
            let id: string | undefined;
            await mutate(async () => {
              if (!canAdd() || !access().mutable) {
                throw new Error('Phone creation unavailable.');
              }
              const target = current();
              if (!target.createPhoneNumber) {
                throw new Error('Phone creation unavailable.');
              }
              const created = await target.createPhoneNumber({ phoneNumber: number });
              current();
              id = created.id;
            });
            if (!id) {
              throw new Error('Phone creation unavailable.');
            }
            return verifier(id);
          }
        : undefined,
    setPrimary:
      available && user.update
        ? id =>
            mutate(async () => {
              if (!access().available) {
                throw new Error('Phone selection unavailable.');
              }
              phone(id);
              const target = current();
              if (!target.update) {
                throw new Error('Phone selection unavailable.');
              }
              await target.update({ primaryPhoneNumberId: id });
            })
        : undefined,
    remove:
      mutable && user.phoneNumbers?.some(item => item.destroy)
        ? id =>
            mutate(async () => {
              if (!access().mutable) {
                throw new Error('Phone removal unavailable.');
              }
              await phone(id).destroy();
            })
        : undefined,
  };
}
