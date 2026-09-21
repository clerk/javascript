import type { OrganizationProfileViewProps } from '@clerk/mosaic/features/organization-profile/organization-profile.view';
import { useState } from 'react';

import { usePreviewImage } from './use-preview-image';

const INITIAL_NAME = 'Clerk';
const INITIAL_SLUG = 'clerkWorkspace-177654156132154';
const MEMBER_COUNT = 20;

const settleAfter = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export interface OrganizationProfileFixtureOptions {
  failWith?: string;
}

export function useOrganizationProfileFixture({ failWith }: OrganizationProfileFixtureOptions = {}) {
  const [activePage, setActivePage] = useState<OrganizationProfileViewProps['activePage']>('general');
  const [name, setName] = useState(INITIAL_NAME);
  const [slug, setSlug] = useState(INITIAL_SLUG);
  const { imageUrl, showFile, clearImage } = usePreviewImage();

  const save = async (apply: () => void) => {
    await settleAfter(800);
    if (failWith) {
      throw new Error(failWith);
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
    onSubmitName: async next => save(() => setName(next)),
    onSubmitSlug: async next => save(() => setSlug(next)),
    onLeave: () => settleAfter(1200),
    onDelete: () => settleAfter(1200),
  };

  const pages: OrganizationProfileViewProps['pages'] = {
    general,
    members: {},
    security: {},
    billing: {},
    apiKeys: {},
  };

  return { activePage, setActivePage, pages, general, name };
}
