import { $clerk } from '../stores/internal';

/**
 * Loop through any Astro component that has requested to mount a UI component and mount it with its respective props.
 */
const mountAllClerkAstroJSComponents = () => {
  const mountFns = {
    'organization-list': 'mountOrganizationList',
    'organization-profile': 'mountOrganizationProfile',
    'organization-switcher': 'mountOrganizationSwitcher',
    'user-button': 'mountUserButton',
    'user-profile': 'mountUserProfile',
    'sign-in': 'mountSignIn',
    'sign-up': 'mountSignUp',
    'google-one-tap': 'openGoogleOneTap',
    waitlist: 'mountWaitlist',
  } as const;

  Object.entries(mountFns).forEach(([category, mountFn]) => {
    const elementsOfCategory = document.querySelectorAll(`[data-clerk-id^="clerk-${category}"]`);
    elementsOfCategory.forEach(el => {
      const clerkId = el.getAttribute('data-clerk-id');
      const props = window.__astro_clerk_component_props?.get(category)?.get(clerkId!);
      if (el) {
        $clerk.get()?.[mountFn](el as HTMLDivElement, props);
      }
    });
  });
};

export { mountAllClerkAstroJSComponents };
