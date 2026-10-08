import type { EnterpriseAccountResource, ExternalAccountResource, UserResource } from '@clerk/shared/types';

import { toUserPreviewData } from './user-preview.model';
import type { UserPreviewStyleProps } from './user-preview.view';
import { UserPreviewView } from './user-preview.view';

// TODO Make this accept an interface with the superset of fields in:
// - User
// - ExternalAccountResource
// - EnterpriseAccountResource

export type UserPreviewProps = UserPreviewStyleProps &
  (
    | {
        user?: Partial<UserResource>;
        externalAccount?: null | undefined;
        enterpriseAccount?: null | undefined;
      }
    | {
        user?: null | undefined;
        externalAccount?: Partial<ExternalAccountResource>;
        enterpriseAccount?: null | undefined;
      }
    | {
        user?: null | undefined;
        externalAccount?: null | undefined;
        enterpriseAccount?: Partial<EnterpriseAccountResource>;
      }
  );

export const UserPreview = (props: UserPreviewProps) => {
  const { user, externalAccount, enterpriseAccount, imageUrl, ...viewProps } = props;
  const data = toUserPreviewData({ user, externalAccount, enterpriseAccount, imageUrl });
  return (
    <UserPreviewView
      {...viewProps}
      {...data}
    />
  );
};
