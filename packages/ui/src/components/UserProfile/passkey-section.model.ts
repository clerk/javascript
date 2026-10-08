import { useClerk, useReverification, useUser } from '@clerk/shared/react';
import type { PasskeyResource } from '@clerk/shared/types';
import { useRef } from 'react';

import type { FormProps } from '@/ui/elements/FormContainer';

import { useProfileRequestScopeModel } from './profile-request-scope.model';

export type PasskeyTarget = { passkey: PasskeyResource; passkeyId?: never } | { passkeyId: string; passkey?: never };
export type UpdatePasskeyFormProps = FormProps & PasskeyTarget;
export type PasskeyRow = Pick<PasskeyResource, 'id' | 'name' | 'createdAt' | 'lastUsedAt'>;

export const usePasskeyModel = (target: string | PasskeyResource) => {
  const clerk = useClerk();
  const { user } = useUser();
  const id = typeof target === 'string' ? target : target.id;
  const scope = useProfileRequestScopeModel(id);
  const legacyResource = typeof target === 'string' ? undefined : target;
  const legacyOwner = useRef({ resource: legacyResource, userId: user?.id });
  if (legacyOwner.current.resource !== legacyResource) {
    legacyOwner.current = { resource: legacyResource, userId: user?.id };
  }
  const ownedLegacyResource = legacyOwner.current.userId === user?.id ? legacyResource : undefined;
  const resolve = () =>
    scope.canRun() ? (clerk.user?.passkeys.find(passkey => passkey.id === id) ?? ownedLegacyResource) : undefined;
  const resource = user?.passkeys.find(passkey => passkey.id === id) ?? ownedLegacyResource;
  const run = async (operation: (passkey: PasskeyResource) => Promise<unknown>, requirePresent = false) => {
    const passkey = resolve();
    if (!passkey) {
      return false;
    }
    try {
      await operation(passkey);
      return scope.canRun() && (!requirePresent || !!resolve());
    } catch (error) {
      if (scope.canRun()) {
        throw error;
      }
      return false;
    }
  };
  return {
    requestKey: scope.requestKey,
    canRun: scope.canRun,
    name: resource?.name || '',
    originalName: resource?.name,
    updateName: (name: string) => run(passkey => passkey.update({ name }), true),
    deleteResource: () => run(passkey => passkey.delete()),
  };
};

export const usePasskeySectionModel = () => {
  const { user } = useUser();
  const scope = useProfileRequestScopeModel('section');
  return {
    requestKey: scope.requestKey,
    hasUser: !!user,
    passkeys:
      user?.passkeys.map(({ id, name, createdAt, lastUsedAt }): PasskeyRow => ({ id, name, createdAt, lastUsedAt })) ??
      [],
  };
};

export const useAddPasskeyModel = () => {
  const { isSatellite } = useClerk();
  const { user } = useUser();
  const scope = useProfileRequestScopeModel('create');
  const createPasskey = useReverification(() => (scope.canRun() ? user?.createPasskey() : undefined));
  return {
    requestKey: scope.requestKey,
    canRun: scope.canRun,
    isSatellite,
    hasUser: !!user,
    createPasskey: async () => {
      if (!scope.canRun()) {
        return false;
      }
      try {
        const result = await createPasskey();
        return !!result && scope.canRun();
      } catch (error) {
        if (scope.canRun()) {
          throw error;
        }
        return false;
      }
    },
  };
};
