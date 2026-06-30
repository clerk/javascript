import { describe, expect, it } from 'vitest';

import { OrganizationProfileGeneral } from '../../panels/organization-profile-general';
import { DeleteOrganization } from '../../sections/delete-organization';
import { LeaveOrganization } from '../../sections/leave-organization';
import { OrganizationProfile } from '../organization-profile';

describe('OrganizationProfile compound parts', () => {
  it('exposes the general panel as a standalone part', () => {
    expect(OrganizationProfile.GeneralPanel).toBe(OrganizationProfileGeneral);
  });

  it('exposes the leave section as a standalone part', () => {
    expect(OrganizationProfile.LeaveSection).toBe(LeaveOrganization);
  });

  it('exposes the delete section as a standalone part', () => {
    expect(OrganizationProfile.DeleteSection).toBe(DeleteOrganization);
  });
});
