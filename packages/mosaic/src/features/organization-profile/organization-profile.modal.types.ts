import type { ModalContentProps } from '../../modals/modal.types';
import type { OrganizationProfileProps } from './organization-profile';

export type OrganizationProfileModalConfig = Pick<
  OrganizationProfileProps,
  'customPages' | 'pageOrder' | 'afterLeaveOrganizationUrl' | 'apiKeysProps'
>;

export interface OrganizationProfileModalPayload {
  page?: OrganizationProfileProps['defaultPage'];
}

export type OrganizationProfileModalContentProps = ModalContentProps<
  OrganizationProfileModalConfig,
  OrganizationProfileModalPayload
>;
