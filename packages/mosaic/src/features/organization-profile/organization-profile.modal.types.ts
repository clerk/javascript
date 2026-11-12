import type { ModalContentProps } from '../../modals/modal.types';
import type { OrganizationProfileProps } from './organization-profile';
import type { OrganizationProfileViewProps } from './organization-profile.view';

export interface OrganizationProfileModalOptions extends Pick<
  OrganizationProfileProps,
  'customPages' | 'pageOrder' | 'afterLeaveOrganizationUrl' | 'apiKeysProps'
> {
  page?: OrganizationProfileViewProps['activePage'];
}

export type OrganizationProfileModalContentProps = ModalContentProps<OrganizationProfileModalOptions>;
