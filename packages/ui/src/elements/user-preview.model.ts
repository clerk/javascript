import { getFullName, getIdentifier } from '@clerk/shared/internal/clerk-js/user';

import type { UserPreviewData } from './user-preview.view';
import type { UserPreviewProps } from './UserPreview';

export const toUserPreviewData = ({
  user,
  externalAccount,
  enterpriseAccount,
  imageUrl,
}: Pick<UserPreviewProps, 'user' | 'externalAccount' | 'enterpriseAccount' | 'imageUrl'>): UserPreviewData => {
  const account = enterpriseAccount || externalAccount || user;
  return {
    name: getFullName(user || {}) || getFullName(externalAccount || {}) || getFullName(enterpriseAccount || {}),
    identifier: getIdentifier(user || {}) || externalAccount?.accountIdentifier?.() || enterpriseAccount?.emailAddress,
    imageUrl: imageUrl || user?.imageUrl || externalAccount?.imageUrl,
    avatar: { firstName: account?.firstName, lastName: account?.lastName },
  };
};
