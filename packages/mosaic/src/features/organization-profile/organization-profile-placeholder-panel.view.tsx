import { EmptyState } from '../../components/empty-state';
import { Profile } from '../../components/profile';
import { fill, useMessages } from '../../localization';
import type { OrganizationProfilePageId } from './organization-profile.types';

export interface OrganizationProfilePlaceholderPanelViewProps {
  page: OrganizationProfilePageId;
}

export function OrganizationProfilePlaceholderPanelView({ page }: OrganizationProfilePlaceholderPanelViewProps) {
  const m = useMessages('organizationProfile');
  const title = m.pages[page];

  return (
    <>
      <Profile.PageTitle>{title}</Profile.PageTitle>
      <EmptyState.Root>
        <EmptyState.Label>{fill(m.placeholder, { page: title })}</EmptyState.Label>
      </EmptyState.Root>
    </>
  );
}
