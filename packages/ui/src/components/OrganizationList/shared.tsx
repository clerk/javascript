import type { PropsWithChildren } from 'react';

import {
  OrganizationPreviewButton,
  OrganizationPreviewListItem,
  OrganizationPreviewListItemButton,
  OrganizationPreviewListItems,
} from '@/ui/common/organizations/OrganizationPreview';

import type { Button } from '../../customizables';
import { descriptors } from '../../customizables';
import type { OrganizationListOrganization } from './organization-list.types';

export const PreviewListItems = (props: PropsWithChildren) => {
  return (
    <OrganizationPreviewListItems
      elementDescriptor={descriptors.organizationListPreviewItems}
      {...props}
    />
  );
};

export const PreviewListItem = (
  props: PropsWithChildren<{
    organizationData: OrganizationListOrganization;
  }>,
) => {
  return (
    <OrganizationPreviewListItem
      elementId='organizationList'
      elementDescriptor={descriptors.organizationListPreviewItem}
      {...props}
    />
  );
};

export const PreviewListItemButton = (props: Parameters<typeof Button>[0]) => {
  return (
    <OrganizationPreviewListItemButton
      elementDescriptor={descriptors.organizationListPreviewItemActionButton}
      {...props}
    />
  );
};

export const OrganizationListPreviewButton = (props: PropsWithChildren<{ onClick: () => void | Promise<void> }>) => {
  return (
    <OrganizationPreviewButton
      elementDescriptor={descriptors.organizationListPreviewButton}
      {...props}
    />
  );
};
