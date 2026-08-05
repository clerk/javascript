import { describe, expect, it } from 'vitest';

import { UserProfilePage } from '../../components/ui-components/UserProfile';
import { useUserProfileCustomPages } from '../useCustomPages';

describe('useUserProfileCustomPages', () => {
  it('accepts OAuth Applications as a reorder item', () => {
    const { addCustomPage, customPages } = useUserProfileCustomPages();

    addCustomPage({
      props: { label: 'oauthApplications' },
      slots: {},
      component: UserProfilePage,
    });

    expect(customPages.value).toEqual([{ label: 'oauthApplications' }]);
  });
});
