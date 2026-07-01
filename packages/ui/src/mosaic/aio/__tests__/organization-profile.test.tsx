import { describe, expect, it } from 'vitest';

import { OrganizationProfileGeneralPanel } from '../../panels/organization-profile-general-panel';
import { OrganizationProfileDeleteSection } from '../../sections/organization-profile-delete-section';
import { OrganizationProfileLeaveSection } from '../../sections/organization-profile-leave-section';
import { OrganizationProfile } from '../organization-profile';

describe('OrganizationProfile compound parts', () => {
  it('exposes the general panel as a standalone part', () => {
    expect(OrganizationProfile.GeneralPanel).toBe(OrganizationProfileGeneralPanel);
  });

  it('exposes the leave section as a standalone part', () => {
    expect(OrganizationProfile.LeaveSection).toBe(OrganizationProfileLeaveSection);
  });

  it('exposes the delete section as a standalone part', () => {
    expect(OrganizationProfile.DeleteSection).toBe(OrganizationProfileDeleteSection);
  });
});
