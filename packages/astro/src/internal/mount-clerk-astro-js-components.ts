import type { Clerk } from '@clerk/shared/types';

import { $clerk } from '../stores/internal';
import type { InternalUIComponentId } from '../types';

/**
 * Loop through any Astro component that has requested to mount a UI component and mount it with its respective props.
 */
const mountAllClerkAstroJSComponents = () => {
  const mountFns = {
    'create-organization': 'mountCreateOrganization',
    'organization-list': 'mountOrganizationList',
    'organization-profile': 'mountOrganizationProfile',
    'organization-switcher': 'mountOrganizationSwitcher',
    'user-avatar': 'mountUserAvatar',
    'user-button': 'mountUserButton',
    'user-profile': 'mountUserProfile',
    'sign-in': 'mountSignIn',
    'sign-up': 'mountSignUp',
    'google-one-tap': 'openGoogleOneTap',
    waitlist: 'mountWaitlist',
    'pricing-table': 'mountPricingTable',
    'api-keys': 'mountAPIKeys',
  } as const satisfies Record<InternalUIComponentId, keyof Clerk>;

  Object.entries(mountFns).forEach(([category, mountFn]) => {
    const elementsOfCategory = document.querySelectorAll(`[data-clerk-id^="clerk-${category}"]`);
    elementsOfCategory.forEach(el => {
      const clerkId = el.getAttribute('data-clerk-id') as string;
      const props = window.__astro_clerk_component_props?.get(category)?.get(clerkId);
      if (el) {
        $clerk.get()?.[mountFn](el as HTMLDivElement, props);
      }
    });
  });
};

export { mountAllClerkAstroJSComponents };
