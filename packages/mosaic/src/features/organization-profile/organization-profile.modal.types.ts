import type { ModalContentProps } from '../../modals/modal.types';
import type { OrganizationProfileProps } from './organization-profile';

export interface OrganizationProfileModalOptions extends Pick<
  OrganizationProfileProps,
  'customPages' | 'pageOrder' | 'afterLeaveOrganizationUrl' | 'apiKeysProps'
> {
  page?: OrganizationProfileProps['defaultPage'];
}

export type OrganizationProfileModalContentProps = ModalContentProps<OrganizationProfileModalOptions>;
