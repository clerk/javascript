import { OrganizationProfileSaveError } from '@clerk/mosaic/features/organization-profile/organization-profile.types';
import type { OrganizationProfileViewProps } from '@clerk/mosaic/features/organization-profile/organization-profile.view';
import { useState } from 'react';

import { useMembersTableFixture } from './members-table-tab';
import { useOrganizationProfileAPIKeysFixture } from './organization-profile-api-keys';
import { usePreviewImage } from './use-preview-image';

const INITIAL_NAME = 'Clerk';
const INITIAL_SLUG = 'clerkWorkspace-177654156132154';
const MEMBER_COUNT = 20;

const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export interface OrganizationProfileFixtureOptions {
  /** Rejects that field's save with this message, scoped to the field so it renders under it. */
  failWith?: Partial<Record<'name' | 'slug', string>>;
}

export function useOrganizationProfileFixture({ failWith }: OrganizationProfileFixtureOptions = {}) {
  const [activePage, setActivePage] = useState<OrganizationProfileViewProps['activePage']>('general');
  const [name, setName] = useState(INITIAL_NAME);
  const [slug, setSlug] = useState(INITIAL_SLUG);
  const { imageUrl, showFile, clearImage } = usePreviewImage();
  const apiKeys = useOrganizationProfileAPIKeysFixture();
  const members = useMembersTableFixture();

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
    memberCount: MEMBER_COUNT,
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
    members: { members },
    security: {},
    billing: {},
    apiKeys,
  };

  return { activePage, setActivePage, pages, general, name };
}
