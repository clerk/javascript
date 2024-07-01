import { $clerk } from '../stores/internal';

<<<<<<< HEAD
/**
 * Loop through any Astro component that has requested to mount a UI component and mount it with its respective props.
 */
=======
>>>>>>> 956f8a51b (feat(astro): Introduce Astro SDK)
const mountAllClerkAstroJSComponents = () => {
  const mountFns = {
    'organization-list': 'mountOrganizationList',
    'organization-profile': 'mountOrganizationProfile',
    'organization-switcher': 'mountOrganizationSwitcher',
    'user-button': 'mountUserButton',
    'user-profile': 'mountUserProfile',
    'sign-in': 'mountSignIn',
    'sign-up': 'mountSignUp',
  } as const;

  Object.entries(mountFns).forEach(([category, mountFn]) => {
    const elementsOfCategory = document.querySelectorAll(`[id^="clerk-${category}"]`);
    elementsOfCategory.forEach(el => {
      const props = window.__astro_clerk_component_props?.get(category)?.get(el.id);
      if (el) {
        $clerk.get()?.[mountFn](el as HTMLDivElement, props);
      }
    });
  });
};

export { mountAllClerkAstroJSComponents };
