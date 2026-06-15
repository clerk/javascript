import type { orgProfileBase } from './aio/organization-profile.messages';

/** Registry of all Mosaic UI message namespaces → base types. Extend as new messages are added. */
export type UIRegistry = {
  organizationProfile: typeof orgProfileBase;
};
