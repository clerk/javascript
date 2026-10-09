import { useDestructiveController } from '@clerk/mosaic/blocks/destructive/destructive.controller';
import type { OrganizationProfileViewProps } from '@clerk/mosaic/features/organization-profile/organization-profile.view';
import { OrganizationProfileDangerSectionView } from '@clerk/mosaic/features/organization-profile/organization-profile-danger-section/organization-profile-danger-section.view';
import type { OrganizationProfileProfileSectionViewProps } from '@clerk/mosaic/features/organization-profile/organization-profile-profile-section/organization-profile-profile-section.view';
import { OrganizationProfileProfileSectionView } from '@clerk/mosaic/features/organization-profile/organization-profile-profile-section/organization-profile-profile-section.view';
import { SaveError } from '@clerk/mosaic/utils/errors';
import { useState } from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosName } from '@/lib/chaos';

import { APIKeysPanelExample, useAPIKeysTableFixture } from './api-keys-table';
import { useInvitationsTableFixture } from './invitations-table-tab';
import { useMembersTableFixture } from './members-table-tab';
import { useInviteMembersFixture } from './organization-profile-invite-members';
import { useRequestsTableFixture } from './requests-table-tab';
import { usePreviewImage } from './use-preview-image';

const exampleOrganization = { name: 'Clerk', slug: 'clerk-177654156132154', memberCount: 20 };

const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export function OrganizationProfileDangerPreview({ name, memberCount }: { name: string; memberCount: number }) {
  const leave = useDestructiveController({ onDelete: () => settleAfter(1200) });
  const destroy = useDestructiveController({ onDelete: () => settleAfter(1200) });
  return (
    <OrganizationProfileDangerSectionView
      name={name}
      memberCount={memberCount}
      leave={leave}
      destroy={destroy}
    />
  );
}

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
      throw new SaveError({ fields: { [field]: { code: 'fixture_error', message } } });
    }
    apply();
  };

  const profile: OrganizationProfileProfileSectionViewProps = {
    name,
    slug,
    imageUrl,
    hasImage: Boolean(imageUrl),
    onLogoChange: showFile,
    onRemoveLogo: clearImage,
    onSubmitName: async next => save('name', () => setName(next)),
    onSubmitSlug: async next => save('slug', () => setSlug(next)),
  };

  const general: OrganizationProfileViewProps['pages']['general'] = {
    children: (
      <>
        <OrganizationProfileProfileSectionView {...profile} />
        <OrganizationProfileDangerPreview
          name={name}
          memberCount={organization.memberCount}
        />
      </>
    ),
  };

  const pages: OrganizationProfileViewProps['pages'] = {
    general,
    members: { members, invitations, requests, onInvite, inviteDialog },
    security: {},
    billing: {},
    apiKeys: <APIKeysPanelExample {...apiKeys} />,
  };

  return { activePage, setActivePage, pages, general, profile, name };
}
