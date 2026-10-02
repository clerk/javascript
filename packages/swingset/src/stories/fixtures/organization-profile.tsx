import { OrganizationProfileSaveError } from '@clerk/mosaic/features/organization-profile/organization-profile.types';
import type { OrganizationProfileViewProps } from '@clerk/mosaic/features/organization-profile/organization-profile.view';
import { useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosName } from '@/lib/chaos';

import { useInvitationsTableFixture } from './invitations-table-tab';
import { useMembersTableFixture } from './members-table-tab';
import { APIKeysPanelExample, useAPIKeysTableFixture } from './api-keys-table';
import { useInviteMembersFixture } from './organization-profile-invite-members';
import { useRequestsTableFixture } from './requests-table-tab';
import { usePreviewImage } from './use-preview-image';

const exampleOrganization = { name: 'Clerk', slug: 'clerkWorkspace-177654156132154', memberCount: 20 };

const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export interface OrganizationProfileFixtureOptions {
  /** Rejects that field's save with this message, scoped to the field so it renders under it. */
  failWith?: Partial<Record<'name' | 'slug', string>>;
}

export function useOrganizationProfileFixture({ failWith }: OrganizationProfileFixtureOptions = {}) {
  const [activePage, setActivePage] = useState<OrganizationProfileViewProps['activePage']>('general');
  const organization = useChaosFixture(exampleOrganization, () => ({
    name: chaosName(0),
    slug: 'a-really-long-organization-slug-that-never-seems-to-end-177654156132154',
    memberCount: 1_234_567,
  }));
  const [name, setName] = useState(organization.name);
  const [slug, setSlug] = useState(organization.slug);
  const { imageUrl, showFile, clearImage } = usePreviewImage();
  const apiKeys = useAPIKeysTableFixture({ subjectKind: 'organization' });
  const members = useMembersTableFixture();
  const invitations = useInvitationsTableFixture();
  const requests = useRequestsTableFixture();
  const { onInvite, inviteDialog } = useInviteMembersFixture();

  const save = async (field: 'name' | 'slug', apply: () => void) => {
    await settleAfter(800);
    const message = failWith?.[field];
    if (message) {
      throw new OrganizationProfileSaveError(message, field);
    }
    apply();
  };

  const general: OrganizationProfileViewProps['pages']['general'] = {
    name,
    slug,
    memberCount: organization.memberCount,
    imageUrl,
    hasImage: Boolean(imageUrl),
    onLogoChange: showFile,
    onRemoveLogo: clearImage,
    onSubmitName: async next => save('name', () => setName(next)),
    onSubmitSlug: async next => save('slug', () => setSlug(next)),
    onLeave: () => settleAfter(1200),
    onDelete: () => settleAfter(1200),
  };

  const pages: OrganizationProfileViewProps['pages'] = {
    general,
    members: { members, invitations, requests, onInvite, inviteDialog },
    security: {},
    billing: {},
    apiKeys: <APIKeysPanelExample {...apiKeys} />,
  };

  return { activePage, setActivePage, pages, general, name };
}
