import { localizationKeys } from '../../customizables';

export const useUserProfilePageModel = (pageId: 'account' | 'security') => ({
  pageId,
  titleKey:
    pageId === 'account'
      ? localizationKeys('userProfile.start.headerTitle__account')
      : localizationKeys('userProfile.start.headerTitle__security'),
});
