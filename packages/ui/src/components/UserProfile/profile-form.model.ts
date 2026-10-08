import { useClerk, useSession, useUser } from '@clerk/shared/react';
import { useEffect, useRef } from 'react';

import { useEnvironment } from '@/ui/contexts';
import { isDefaultImage } from '@/ui/utils/image';

import type { ProfileFormData, ProfileFormProps } from './profile-form.types';

export type { ProfileFormProps } from './profile-form.types';

export const useProfileFormModel = (props: ProfileFormProps): ProfileFormData => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { first_name, last_name } = useEnvironment().userSettings.attributes;
  const actor = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const scopeKey = JSON.stringify([actor, sessionId, clientId]);
  const mounted = useRef(true);
  const current = useRef({ scopeKey, version: 0 });
  const version = current.current.version + (current.current.scopeKey === scopeKey ? 0 : 1);
  current.current = { scopeKey, version };
  const latestCallbacks = useRef<ProfileFormProps>();
  latestCallbacks.current = props;
  const canRun = () =>
    mounted.current &&
    !!actor &&
    clerk.user?.id === actor &&
    clerk.session?.id === sessionId &&
    clerk.client?.id === clientId &&
    current.current.version === version;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      latestCallbacks.current = undefined;
    };
  }, []);
  const complete = async () => {
    if (canRun()) {
      await Promise.resolve(latestCallbacks.current?.onSuccess?.());
    }
  };

  if (!user) {
    return { status: 'hidden' };
  }

  return {
    status: 'ready',
    scopeKey,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    imageUrl: user.imageUrl,
    showFirstName: !!first_name?.enabled,
    showLastName: !!last_name?.enabled,
    firstNameRequired: !!first_name?.required,
    lastNameRequired: !!last_name?.required,
    nameEditDisabled: user.enterpriseAccounts.some(account => account.active),
    canRemoveAvatar: !isDefaultImage(user.imageUrl),
    complete,
    onReset: () => {
      if (canRun()) {
        latestCallbacks.current?.onReset?.();
      }
    },
    updateName: async (firstName, lastName) => {
      if (!canRun() || !clerk.user) {
        return;
      }
      try {
        await clerk.user.update({ firstName, lastName });
        await complete();
      } catch (error) {
        if (canRun()) {
          throw error;
        }
      }
    },
    setProfileImage: async file => {
      if (!canRun() || !clerk.user) {
        return;
      }
      try {
        await clerk.user.setProfileImage({ file });
        await complete();
      } catch (error) {
        if (canRun()) {
          throw error;
        }
      }
    },
  };
};
