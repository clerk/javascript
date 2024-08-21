// @ts-nocheck
// We're using @ts-nocheck here because this file gets copied to the dist folder
// when published and is not bundled with tsup. This can cause TS to throw errors
// even though we're not bundling it.

/**
 * Control Components
 */
export { default as SignedIn } from './control/SignedIn.astro';
export { default as SignedOut } from './control/SignedOut.astro';
export { default as Protect } from './control/Protect.astro';
export { default as AuthenticateWithRedirectCallback } from './control/AuthenticateWithRedirectCallback.astro';

/**
 * Unstyled Components
 */
export { default as SignInButton } from './unstyled/SignInButton.astro';
export { default as SignUpButton } from './unstyled/SignUpButton.astro';
export { default as SignOutButton } from './unstyled/SignOutButton.astro';

/**
 * UI Components
 */
export { default as SignIn } from './interactive/SignIn.astro';
export { default as SignUp } from './interactive/SignUp.astro';
export { UserButton } from './interactive/UserButton';
export { default as UserProfile } from './interactive/UserProfile.astro';
export { default as OrganizationProfile } from './interactive/OrganizationProfile.astro';
export { default as OrganizationSwitcher } from './interactive/OrganizationSwitcher.astro';
export { default as OrganizationList } from './interactive/OrganizationList.astro';
export { default as GoogleOneTap } from './interactive/GoogleOneTap.astro';
