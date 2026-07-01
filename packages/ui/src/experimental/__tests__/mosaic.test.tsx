import { describe, expect, it } from 'vitest';

import { OrganizationProfileGeneralPanel as GeneralPanelPart } from '../../mosaic/panels/organization-profile-general-panel';
import { OrganizationProfileDeleteSection as DeleteSectionPart } from '../../mosaic/sections/organization-profile-delete-section';
import { OrganizationProfileLeaveSection as LeaveSectionPart } from '../../mosaic/sections/organization-profile-leave-section';
import {
  OrganizationProfile,
  OrganizationProfileDeleteSection,
  OrganizationProfileGeneralPanel,
  OrganizationProfileLeaveSection,
} from '../mosaic';

// The parts are exposed two ways: as a compound namespace (`OrganizationProfile.GeneralPanel`,
// ergonomic inside a client component) and as flat top-level exports (RSC-safe — each is its own
// client reference, so a React Server Component can render it without a `'use client'` boundary).
// Property access on a client reference is impossible across the RSC boundary, so the flat exports
// are the only form reachable from a server component. Both forms must resolve to the same
// component object.
describe('experimental/mosaic flat part exports', () => {
  it('exports the general panel as a top-level export equal to the compound part', () => {
    expect(OrganizationProfileGeneralPanel).toBe(GeneralPanelPart);
    expect(OrganizationProfileGeneralPanel).toBe(OrganizationProfile.GeneralPanel);
  });

  it('exports the leave section as a top-level export equal to the compound part', () => {
    expect(OrganizationProfileLeaveSection).toBe(LeaveSectionPart);
    expect(OrganizationProfileLeaveSection).toBe(OrganizationProfile.LeaveSection);
  });

  it('exports the delete section as a top-level export equal to the compound part', () => {
    expect(OrganizationProfileDeleteSection).toBe(DeleteSectionPart);
    expect(OrganizationProfileDeleteSection).toBe(OrganizationProfile.DeleteSection);
  });
});
