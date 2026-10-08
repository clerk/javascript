import {
  useClerk,
  useOrganization,
  useOrganizationList,
  useSafeLayoutEffect,
  useSession,
  useUser,
} from '@clerk/shared/react';
import type { OrganizationResource } from '@clerk/shared/types';
import { useReducer, useRef } from 'react';

import { useEnvironment } from '@/ui/contexts';
import type { LocalizationKey } from '@/ui/localization';

import { organizationListParams } from '../OrganizationSwitcher/utils';
import type { CreateOrganizationFormData } from './create-organization-form.types';

export type CreateOrganizationFormProps = {
  skipInvitationScreen: boolean;
  navigateAfterCreateOrganization?: (organization: OrganizationResource) => Promise<unknown>;
  onCancel?: () => void;
  onComplete?: () => void;
  flow: 'default' | 'organizationList';
  startPage?: {
    headerTitle?: LocalizationKey;
    headerSubtitle?: LocalizationKey;
  };
};

export const useCreateOrganizationFormModel = (props: CreateOrganizationFormProps): CreateOrganizationFormData => {
  const clerk = useClerk();
  const { user } = useUser();
  const { session } = useSession();
  const actor = user?.id;
  const sessionId = session?.id;
  const clientId = clerk.client?.id;
  const { organizationSettings } = useEnvironment();
  const organizationSlugEnabled = !organizationSettings.slug.disabled;
  const scopeKey = JSON.stringify([
    actor,
    sessionId,
    clientId,
    props.flow,
    props.skipInvitationScreen,
    organizationSlugEnabled,
  ]);
  const mounted = useRef(true);
  const [, notifyCreationChange] = useReducer((revision: number) => revision + 1, 0);
  const current = useRef({ scopeKey, version: 0, props, clerk });
  const creation = useRef<{
    organization: OrganizationResource;
    file: File | null | undefined;
    logoUploaded: boolean;
    activated: boolean;
  } | null>(null);
  const sourceChanged = current.current.scopeKey !== scopeKey || current.current.clerk !== clerk;
  const version = current.current.version + (sourceChanged ? 1 : 0);
  if (sourceChanged) {
    creation.current = null;
  }
  current.current = { scopeKey, version, props, clerk };
  const canRun = () =>
    mounted.current &&
    !!actor &&
    clerk.user?.id === actor &&
    clerk.session?.id === sessionId &&
    clerk.client?.id === clientId &&
    current.current.version === version;
  useSafeLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      creation.current = null;
    };
  }, []);
  const { createOrganization, isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: { ...organizationListParams.userMemberships, keepPreviousData: false },
  });
  const latestMemberships = useRef(userMemberships);
  latestMemberships.current = userMemberships;
  const { organization } = useOrganization();

  const create: CreateOrganizationFormData['create'] = async ({ name, slug, file }, canContinue = () => true) => {
    const isCurrent = () => canRun() && canContinue();
    if (!isLoaded || !isCurrent()) {
      return null;
    }
    try {
      let progress = creation.current;
      if (!progress) {
        const createdOrganization = await createOrganization({
          name,
          ...(organizationSlugEnabled ? { slug } : {}),
        });
        if (!isCurrent()) {
          return null;
        }
        progress = { organization: createdOrganization, file, logoUploaded: !file, activated: false };
        creation.current = progress;
        notifyCreationChange();
      }
      if (!progress.logoUploaded && progress.file) {
        await progress.organization.setLogo({ file: progress.file });
        if (!isCurrent()) {
          return null;
        }
        progress.logoUploaded = true;
        progress.file = undefined;
      }
      if (!progress.activated) {
        await setActive({ organization: progress.organization });
        if (!isCurrent()) {
          return null;
        }
        progress.activated = true;
        void latestMemberships.current.revalidate?.();
      }
      return {
        skipInvitations:
          current.current.props.skipInvitationScreen ?? progress.organization.maxAllowedMemberships === 1,
      };
    } catch (error) {
      if (isCurrent()) {
        throw error;
      }
      return null;
    }
  };

  const complete = async (canContinue: () => boolean = () => true) => {
    const isCurrent = () => canRun() && canContinue();
    const progress = creation.current;
    if (!isCurrent() || !progress?.activated || !progress.organization) {
      return;
    }
    try {
      await current.current.props.navigateAfterCreateOrganization?.(progress.organization);
      if (isCurrent()) {
        creation.current = null;
        notifyCreationChange();
        current.current.props.onComplete?.();
      }
    } catch (error) {
      if (isCurrent()) {
        throw error;
      }
    }
  };

  return {
    scopeKey: JSON.stringify([scopeKey, version]),
    canRun,
    isCreated: !!creation.current,
    create,
    complete,
    hasOrganization: !!organization,
    organizationSlugEnabled,
    onCancel: props.onCancel
      ? () => {
          if (canRun()) {
            current.current.props.onCancel?.();
          }
        }
      : undefined,
    flow: props.flow,
    startPage: props.startPage,
  };
};
