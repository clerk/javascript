//@ts-check

/** @typedef {import('@clerk/clerk-js').Clerk} Clerk */

/**
 * @typedef {object} CustomWindowObject
 * @property {Clerk} [Clerk]
 */

/**
 * @typedef {Window & CustomWindowObject} CustomWindow
 */

/** @type {CustomWindow} */
const windowWithClerk = window;

const Clerk = /** @type {Clerk} **/ (windowWithClerk.Clerk);
if (!Clerk) {
  throw new Error(`clerk-js is not loaded!`);
}

const app = /** @type {HTMLDivElement} **/ (document.getElementById('app'));

/**
 * @param {HTMLDivElement} element
 */
function mountIndex(element) {
  const user = Clerk.user;
  element.innerHTML = `<pre><code>${JSON.stringify({ user }, null, 2)}</code></pre>`;
}

/** @typedef {keyof typeof routes} Route */

const routes = {
  '/': () => {
    mountIndex(app);
  },
  '/sign-in': () => {
    Clerk.mountSignIn(app, {});
  },
  '/sign-up': () => {
    Clerk.mountSignUp(app, {});
  },
  '/user-button': () => {
    Clerk.mountUserButton(app, {});
  },
  '/user-profile': () => {
    Clerk.mountUserProfile(app, {});
  },
  '/create-organization': () => {
    Clerk.mountCreateOrganization(app, {});
  },
  '/organization-list': () => {
    Clerk.mountOrganizationList(app, {});
  },
  '/organization-profile': () => {
    Clerk.mountOrganizationProfile(app, {});
  },
  '/organization-switcher': () => {
    Clerk.mountOrganizationSwitcher(app, {});
  },
  '/waitlist': () => {
    Clerk.mountWaitlist(app, {});
  },
};

/**
 * @param {string} currentRoute
 */
function addCurrentRouteIndicator(currentRoute) {
  const link = document.querySelector(`a[href="${currentRoute}"]`);
  if (!link) {
    return;
  }
  link.classList.remove('text-gray-400', 'hover:bg-[#1D1D21]', 'hover:text-white');
  link.classList.add('bg-[#1D1D21]', 'text-white');
}

(async () => {
  const route = window.location.pathname;
  if (route in routes) {
    const renderCurrentRoute = routes[route];
    addCurrentRouteIndicator(route);
    await Clerk.load({
      signInUrl: '/sign-in',
      signUpUrl: '/sign-up',
    });
    renderCurrentRoute();
  } else {
    console.error(`Unknown route: "${route}".`);
  }
})();
