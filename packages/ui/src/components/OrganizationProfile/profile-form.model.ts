import { useClerk, useOrganization, useSession, useUser } from '@clerk/shared/react';
import { useEffect, useRef } from 'react';

import { useEnvironment } from '@/ui/contexts';
import { isDefaultImage } from '@/ui/utils/image';

import type { OrganizationProfileFormData, OrganizationProfileFormProps } from './profile-form.types';

export const useOrganizationProfileFormModel = (props: OrganizationProfileFormProps): OrganizationProfileFormData => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const { organization } = useOrganization();
  const { organizationSettings } = useEnvironment();
  const actor = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const organizationId = organization?.id;
  const scopeKey = JSON.stringify([actor, sessionId, clientId, organizationId]);
  const mounted = useRef(true);
  const current = useRef({ scopeKey, version: 0 });
  const version = current.current.version + (current.current.scopeKey === scopeKey ? 0 : 1);
  current.current = { scopeKey, version };
  const latestCallbacks = useRef<OrganizationProfileFormProps>();
  latestCallbacks.current = props;
  const canRun = () =>
    mounted.current &&
    !!actor &&
    !!organizationId &&
    clerk.user?.id === actor &&
    clerk.session?.id === sessionId &&
    clerk.client?.id === clientId &&
    clerk.organization?.id === organizationId &&
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

  if (!organization) {
    return { status: 'hidden' };
  }

  return {
    status: 'ready',
    scopeKey,
    name: organization.name,
    slug: organization.slug,
    initialSlug: organization.slug || '',
    avatar: { name: organization.name, imageUrl: organization.imageUrl },
    canRemoveAvatar: !isDefaultImage(organization.imageUrl),
    slugEnabled: !organizationSettings.slug.disabled,
    complete,
    onReset: () => {
      if (canRun()) {
        latestCallbacks.current?.onReset?.();
      }
    },
    update: async params => {
      if (!canRun() || !clerk.organization) {
        return;
      }
      try {
        await clerk.organization.update(params);
        await complete();
      } catch (error) {
        if (canRun()) {
          throw error;
        }
      }
    },
    setLogo: async file => {
      if (!canRun() || !clerk.organization) {
        return;
      }
      try {
        await clerk.organization.setLogo({ file });
        await complete();
      } catch (error) {
        if (canRun()) {
          throw error;
        }
      }
    },
  };
};
