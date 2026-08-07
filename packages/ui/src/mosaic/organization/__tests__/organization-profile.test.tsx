import { describe, expect, it } from 'vitest';

import { OrganizationProfile } from '../organization-profile';
import { OrganizationProfileDeleteSection } from '../organization-profile-delete-section';
import { OrganizationProfileGeneralPanel } from '../organization-profile-general-panel';
import { OrganizationProfileLeaveSection } from '../organization-profile-leave-section';
import { OrganizationProfileSecurityPanel } from '../organization-profile-security-panel';

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

  it('exposes the security panel as a standalone part', () => {
    expect(OrganizationProfile.SecurityPanel).toBe(OrganizationProfileSecurityPanel);
  });
});
