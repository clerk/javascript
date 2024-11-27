//@ts-check

/** @typedef {import('@clerk/clerk-js').Clerk} Clerk */

/**
 * @typedef {object} ComponentPropsControl
 * @property {(props: unknown) => void} setProps
 * @property {() => (any | null)} getProps
 */

const AVAILABLE_COMPONENTS = /** @type {const} */ ([
  'clerk', // While not a component, we want to support passing options to the Clerk class.
  'signIn',
  'signUp',
  'userButton',
  'userProfile',
  'createOrganization',
  'organizationList',
  'organizationProfile',
  'organizationSwitcher',
  'waitlist',
]);

const COMPONENT_PROPS_NAMESPACE = 'clerk-js-sandbox';

const urlParams = new URL(window.location.href).searchParams;
for (const [component, encodedProps] of urlParams.entries()) {
  if (AVAILABLE_COMPONENTS.includes(/** @type {typeof AVAILABLE_COMPONENTS[number]} */ (component))) {
    localStorage.setItem(`${COMPONENT_PROPS_NAMESPACE}-${component}`, encodedProps);
  }
}

/**
 * @param {typeof AVAILABLE_COMPONENTS[number]} component
 * @param {unknown} props
 */
function setComponentProps(component, props) {
  const encodedProps = JSON.stringify(props);

  const url = new URL(window.location.href);
  url.searchParams.set(component, encodedProps);

  window.location.href = url.toString();
}

/**
 * @param {typeof AVAILABLE_COMPONENTS[number]} component
 * @returns {unknown | null}
 */
function getComponentProps(component) {
  const url = new URL(window.location.href);
  const encodedProps = url.searchParams.get(component);
  if (encodedProps) {
    return JSON.parse(encodedProps);
  }

  const localEncodedProps = localStorage.getItem(`${COMPONENT_PROPS_NAMESPACE}-${component}`);
  if (localEncodedProps) {
    return JSON.parse(localEncodedProps);
  }

  return null;
}

/**
 * @param {typeof AVAILABLE_COMPONENTS[number]} component
 * @returns {ComponentPropsControl}
 */
function buildComponentControls(component) {
  return {
    setProps(props) {
      setComponentProps(component, props);
    },
    getProps() {
      return getComponentProps(component);
    },
  };
}

/**
 * @type {Record<typeof AVAILABLE_COMPONENTS[number], ComponentPropsControl>}
 */
const componentControls = {
  clerk: buildComponentControls('clerk'),
  signIn: buildComponentControls('signIn'),
  signUp: buildComponentControls('signUp'),
  userButton: buildComponentControls('userButton'),
  userProfile: buildComponentControls('userProfile'),
  createOrganization: buildComponentControls('createOrganization'),
  organizationList: buildComponentControls('organizationList'),
  organizationProfile: buildComponentControls('organizationProfile'),
  organizationSwitcher: buildComponentControls('organizationSwitcher'),
  waitlist: buildComponentControls('waitlist'),
};

/**
 * @typedef {object} CustomWindowObject
 * @property {Clerk} [Clerk]
 * @property {Record<typeof AVAILABLE_COMPONENTS[number], ComponentPropsControl>} [components]
 */

/**
 * @typedef {Window & CustomWindowObject} CustomWindow
 */

/** @type {CustomWindow} */
const windowWithClerk = window;
windowWithClerk.components = componentControls;

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
    Clerk.mountSignIn(app, componentControls.signIn.getProps() ?? {});
  },
  '/sign-up': () => {
    Clerk.mountSignUp(app, componentControls.signUp.getProps() ?? {});
  },
  '/user-button': () => {
    Clerk.mountUserButton(app, componentControls.userButton.getProps() ?? {});
  },
  '/user-profile': () => {
    Clerk.mountUserProfile(app, componentControls.userProfile.getProps() ?? {});
  },
  '/create-organization': () => {
    Clerk.mountCreateOrganization(app, componentControls.createOrganization.getProps() ?? {});
  },
  '/organization-list': () => {
    Clerk.mountOrganizationList(app, componentControls.organizationList.getProps() ?? {});
  },
  '/organization-profile': () => {
    Clerk.mountOrganizationProfile(app, componentControls.organizationProfile.getProps() ?? {});
  },
  '/organization-switcher': () => {
    Clerk.mountOrganizationSwitcher(app, componentControls.organizationSwitcher.getProps() ?? {});
  },
  '/waitlist': () => {
    Clerk.mountWaitlist(app, componentControls.waitlist.getProps() ?? {});
  },
  '/accountless': () => {
    Clerk.__unstable__updateProps({ options: { __internal_claimAccountlessKeysUrl: '/test-url' } });
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
  link.removeAttribute('aria-current');
  link.setAttribute('aria-current', 'page');
}

(async () => {
  const route = window.location.pathname;
  if (route in routes) {
    const renderCurrentRoute = routes[route];
    addCurrentRouteIndicator(route);
    await Clerk.load({
      ...(componentControls.clerk.getProps() ?? {}),
      signInUrl: '/sign-in',
      signUpUrl: '/sign-up',
      waitlistUrl: '/waitlist',
    });
    renderCurrentRoute();
  } else {
    console.error(`Unknown route: "${route}".`);
  }
})();
