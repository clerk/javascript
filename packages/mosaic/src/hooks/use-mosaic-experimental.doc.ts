import type { HookDoc } from '../docs-schema';
import type { MosaicExperimental } from './use-mosaic-experimental';

export default {
  name: 'useMosaicExperimental',
  description:
    "Reads the experimental flags passed to `MosaicProvider`'s `experimental` prop. Returns `{}` outside a provider.",
  useFor: ['gating behavior behind an experimental `MosaicProvider` flag'],
  keywords: ['experimental', 'feature flag', 'new profiles', 'provider'],
  returns: {
    newProfiles: {
      type: 'boolean',
      doc: "Opens Mosaic's own `UserProfile` and `OrganizationProfile` from `UserButton` and `OrganizationSwitcher`, instead of Clerk's profile modals.",
      default: 'false',
    },
  },
} satisfies HookDoc<undefined, MosaicExperimental>;
