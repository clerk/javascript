import { createWebHistory, createRouter } from 'vue-router';
import { useAuth } from '@clerk/vue';

import HomeView from './views/Home.vue';
import { Ref, watch } from 'vue';

const routes = [
  { name: 'Home', path: '/', component: HomeView },
  {
    name: 'Sign in',
    path: '/sign-in',
    component: () => import('./views/SignIn.vue'),
  },
  {
    name: 'Profile',
    path: '/profile',
    component: () => import('./views/Profile.vue'),
  },
  {
    name: 'Admin',
    path: '/admin',
    component: () => import('./views/Admin.vue'),
  },
  {
    name: 'Unstyled',
    path: '/unstyled',
    component: () => import('./views/Unstyled.vue'),
  },
  {
    name: 'CustomUserProfile',
    path: '/custom-pages/user-profile',
    component: () => import('./views/custom-pages/UserProfile.vue'),
  },
  {
    name: 'CustomOrganizationProfile',
    path: '/custom-pages/organization-profile',
    component: () => import('./views/custom-pages/OrganizationProfile.vue'),
  },
  {
    name: 'PricingTable',
    path: '/pricing-table',
    component: () => import('./views/PricingTable.vue'),
  },
  {
    name: 'UserAvatar',
    path: '/user-avatar',
    component: () => import('./views/UserAvatar.vue'),
  },
  // This was added for billing tests
  {
    name: 'User',
    path: '/user',
    component: () => import('./views/Profile.vue'),
  },
  // Billing button routes
  {
    name: 'CheckoutBtn',
    path: '/billing/checkout-btn',
    component: () => import('./views/billing/CheckoutBtn.vue'),
  },
  {
    name: 'PlanDetailsBtn',
    path: '/billing/plan-details-btn',
    component: () => import('./views/billing/PlanDetailsBtn.vue'),
  },
  {
    name: 'SubscriptionDetailsBtn',
    path: '/billing/subscription-details-btn',
    component: () => import('./views/billing/SubscriptionDetailsBtn.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, _, next) => {
  const { isSignedIn, isLoaded } = useAuth();
  const authenticatedPages = ['Profile', 'Admin', 'CustomUserProfile', 'CustomOrganizationProfile', 'UserAvatar'];

  if (!isLoaded.value) {
    await waitForClerkJsLoaded(isLoaded);
  }

  if (isSignedIn.value && to.name === 'Sign in') {
    next('/profile');
  } else if (!isSignedIn.value && authenticatedPages.includes(to.name)) {
    next('/sign-in');
  } else {
    next();
  }
});

/**
 * The vue router navigation guard runs immediately on page load
 * so we need to wait for Clerk.js to load before we can check
 * if the user is signed in.
 */
async function waitForClerkJsLoaded(isLoaded: Ref<boolean>) {
  return new Promise<void>(resolve => {
    const unwatch = watch(isLoaded, value => {
      if (value) {
        unwatch();
        resolve();
      }
    });
  });
}

export default router;
