import type { SignInResource } from '@clerk/types';

import * as l from '../../localizations';
import type { Clerk as ClerkType } from '../';

const AVAILABLE_LOCALES = Object.keys(l) as (keyof typeof l)[];

function fillLocalizationSelect() {
  const select = document.getElementById('localizationSelect') as HTMLSelectElement;

  for (const locale of AVAILABLE_LOCALES) {
    if (locale === 'enUS') {
      select.add(new Option(locale, locale, true, true));
      continue;
    }

    select.add(new Option(locale, locale));
  }
}

interface ComponentPropsControl {
  setProps: (props: unknown) => void;
  getProps: () => any | null;
}

const AVAILABLE_COMPONENTS = [
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
  'pricingTable',
  'oauthConsent',
  'signInObservable',
] as const;

const COMPONENT_PROPS_NAMESPACE = 'clerk-js-sandbox';

const urlParams = new URL(window.location.href).searchParams;
for (const [component, encodedProps] of urlParams.entries()) {
  if (AVAILABLE_COMPONENTS.includes(component as (typeof AVAILABLE_COMPONENTS)[number])) {
    localStorage.setItem(`${COMPONENT_PROPS_NAMESPACE}-${component}`, encodedProps);
  }
}

function setComponentProps(component: (typeof AVAILABLE_COMPONENTS)[number], props: unknown) {
  const encodedProps = JSON.stringify(props);

  const url = new URL(window.location.href);
  url.searchParams.set(component, encodedProps);

  window.location.href = url.toString();
}

function getComponentProps(component: (typeof AVAILABLE_COMPONENTS)[number]): unknown | null {
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

function buildComponentControls(component: (typeof AVAILABLE_COMPONENTS)[number]): ComponentPropsControl {
  return {
    setProps(props) {
      setComponentProps(component, props);
    },
    getProps() {
      return getComponentProps(component);
    },
  };
}

const componentControls: Record<(typeof AVAILABLE_COMPONENTS)[number], ComponentPropsControl> = {
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
  pricingTable: buildComponentControls('pricingTable'),
  oauthConsent: buildComponentControls('oauthConsent'),
  signInObservable: buildComponentControls('signInObservable'),
};

declare global {
  interface Window {
    components: Record<(typeof AVAILABLE_COMPONENTS)[number], ComponentPropsControl>;
  }
}

window.components = componentControls;

const Clerk = window.Clerk;
function assertClerkIsLoaded(c: ClerkType | undefined): asserts c is ClerkType {
  if (!c) {
    throw new Error('Clerk is not loaded');
  }
}

const app = document.getElementById('app') as HTMLDivElement;

function mountIndex(element: HTMLDivElement) {
  assertClerkIsLoaded(Clerk);
  const user = Clerk.user;
  element.innerHTML = `<pre class="text-left whitespace-pre overflow-x-auto bg-white p-4 border border-gray-100 rounded-md text-sm"><code>${JSON.stringify({ user }, null, 2)}</code></pre>`;
}

function mountOpenSignInButton(element: HTMLDivElement, props: any) {
  const button = document.createElement('button');
  button.textContent = 'Open Sign In';
  button.onclick = () => {
    Clerk?.openSignIn(props);
  };
  element.appendChild(button);
}

function mountOpenSignUpButton(element: HTMLDivElement, props: any) {
  const button = document.createElement('button');
  button.textContent = 'Open Sign Up';
  button.onclick = () => {
    Clerk?.openSignUp(props);
  };
  element.appendChild(button);
}

function addCurrentRouteIndicator(currentRoute: string) {
  const link = document.querySelector(`a[href="${currentRoute}"]`);
  if (!link) {
    return;
  }
  link.removeAttribute('aria-current');
  link.setAttribute('aria-current', 'page');
}

function appearanceVariableOptions() {
  assertClerkIsLoaded(Clerk);

  const resetVariablesBtn = document.getElementById('resetVariablesBtn');

  const variableInputIds = [
    'colorPrimary',
    'colorNeutral',
    'colorBackground',
    'colorTextOnPrimaryBackground',
    'colorDanger',
    'colorSuccess',
    'colorWarning',
    'colorText',
    'colorTextSecondary',
    'colorInputText',
    'colorInputBackground',
    'colorShimmer',
    'spacingUnit',
    'borderRadius',
  ] as const;

  const variableInputs = variableInputIds.reduce(
    (acc, id) => {
      const element = document.getElementById(id) as HTMLInputElement | null;
      if (!element) {
        throw new Error(`Could not find input element with id: ${id}`);
      }
      acc[id] = element;
      return acc;
    },
    {} as Record<(typeof variableInputIds)[number], HTMLInputElement>,
  );

  Object.entries(variableInputs).forEach(([key, input]) => {
    const savedColor = sessionStorage.getItem(key);
    if (savedColor) {
      input.value = savedColor;
    }
  });

  const updateVariables = () => {
    void Clerk.__unstable__updateProps({
      appearance: {
        variables: Object.fromEntries(
          Object.entries(variableInputs).map(([key, input]) => {
            sessionStorage.setItem(key, input.value);
            return [key, input.value];
          }),
        ),
      },
    });
  };

  Object.values(variableInputs).forEach(input => {
    input.addEventListener('change', updateVariables);
  });

  resetVariablesBtn?.addEventListener('click', () => {
    Object.values(variableInputs).forEach(input => {
      input.value = input.defaultValue;
    });
    updateVariables();
  });

  return { updateVariables };
}

function otherOptions() {
  assertClerkIsLoaded(Clerk);

  const resetOtherOptionsBtn = document.getElementById('resetOtherOptionsBtn');

  const otherOptionsInputs: Record<string, HTMLSelectElement> = {
    localization: document.getElementById('localizationSelect') as HTMLSelectElement,
  };

  Object.entries(otherOptionsInputs).forEach(([key, input]) => {
    const savedValue = sessionStorage.getItem(key);
    if (savedValue) {
      input.value = savedValue;
    }
  });

  const updateOtherOptions = () => {
    void Clerk.__unstable__updateProps({
      options: Object.fromEntries(
        Object.entries(otherOptionsInputs).map(([key, input]) => {
          sessionStorage.setItem(key, input.value);

          if (key === 'localization') {
            return [key, l[input.value as keyof typeof l]];
          }

          return [key, input.value];
        }),
      ),
    });
  };

  Object.values(otherOptionsInputs).forEach(input => {
    input.addEventListener('change', updateOtherOptions);
  });

  resetOtherOptionsBtn?.addEventListener('click', () => {
    otherOptionsInputs.localization.value = 'enUS';
    updateOtherOptions();
  });

  return { updateOtherOptions };
}

function mountSignInObservable(element: HTMLDivElement) {
  assertClerkIsLoaded(Clerk);

  // Create container for status display
  const statusContainer = document.createElement('div');
  statusContainer.className = 'p-4 border border-gray-200 rounded-md mb-4';
  element.appendChild(statusContainer);

  // Create controls container
  const controlsContainer = document.createElement('div');
  controlsContainer.style.marginBottom = '1rem';
  controlsContainer.style.display = 'flex';
  controlsContainer.style.flexDirection = 'column';

  // Create store state display
  const storeStateDisplay = document.createElement('div');
  storeStateDisplay.className = 'p-2 bg-gray-50 rounded text-sm font-mono';

  // Append store state display to controlsContainer
  controlsContainer.appendChild(storeStateDisplay);

  element.appendChild(controlsContainer);

  // Create sign in form
  const form = document.createElement('form');
  form.className = 'space-y-4';

  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.placeholder = 'Email';
  emailInput.className = 'w-full p-2 border rounded';

  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.placeholder = 'Password';
  passwordInput.className = 'w-full p-2 border rounded';

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.textContent = 'Sign In';
  submitButton.className = 'w-full p-2 bg-blue-500 text-white rounded';

  form.appendChild(emailInput);
  form.appendChild(passwordInput);
  form.appendChild(submitButton);
  element.appendChild(form);

  let signIn: SignInResource;

  let isInitialized = false;

  // Create updateStatus function in the outer scope
  const updateStatus = () => {
    if (!signIn) {
      console.error('SignIn object is not initialized');
      return;
    }
    const fetchStatus = signIn.fetchStatus;
    const error = signIn.signInError.global;
    const status = signIn.status;

    // Update status container with animation
    statusContainer.innerHTML = `
      <div class="space-y-2 transition-all duration-300">
        <div class="flex items-center gap-2">
          <strong>Fetch Status:</strong>
          <span class="px-2 py-0.5 rounded text-sm ${
            fetchStatus === 'fetching'
              ? 'bg-blue-100 text-blue-700'
              : fetchStatus === 'error'
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
          }">${fetchStatus}</span>
        </div>
        <div class="flex items-center gap-2">
          <strong>Sign In Status:</strong>
          <span class="px-2 py-0.5 rounded text-sm ${
            status === 'needs_first_factor'
              ? 'bg-yellow-100 text-yellow-700'
              : status === 'complete'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
          }">${status || 'null'}</span>
        </div>
        ${error ? `<div class="text-red-500"><strong>Error:</strong> ${error}</div>` : ''}
      </div>
    `;

    // Update store state display
    storeStateDisplay.innerHTML = `
      <div class="space-y-1">
        <div>Store State:</div>
        <pre class="whitespace-pre-wrap">${JSON.stringify(
          {
            fetchStatus,
            status,
            error: error || null,
          },
          null,
          2,
        )}</pre>
      </div>
    `;
  };

  // Initialize SignIn instance
  const initializeSignIn = async () => {
    try {
      // Show loading state
      statusContainer.innerHTML = `
        <div class="text-blue-500">
          <strong>Status:</strong> Initializing...
        </div>
      `;

      // Wait for Clerk to be loaded and client to be ready
      const waitForClerk = async () => {
        if (!Clerk.loaded) {
          await new Promise<void>(resolve => {
            const checkLoaded = () => {
              if (Clerk.loaded) {
                resolve();
              } else {
                setTimeout(checkLoaded, 100);
              }
            };
            checkLoaded();
          });
        }

        // Wait for client to be ready
        if (!Clerk.client) {
          await new Promise<void>(resolve => {
            const checkClient = () => {
              if (Clerk.client) {
                resolve();
              } else {
                setTimeout(checkClient, 100);
              }
            };
            checkClient();
          });
        }
      };

      await waitForClerk();

      // Initial update
      updateStatus();

      // Update status to show initialization complete
      statusContainer.innerHTML = `
        <div class="text-green-500">
          <strong>Status:</strong> Ready to sign in
        </div>
      `;
    } catch (error) {
      console.error('Failed to initialize:', error);
      statusContainer.innerHTML = `
        <div class="text-red-500">
          <strong>Error:</strong> ${error instanceof Error ? error.message : 'Failed to initialize'}
        </div>
      `;
      isInitialized = false;
    }
  };

  // Handle form submission
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  form.addEventListener('submit', async e => {
    e.preventDefault();

    try {
      if (!isInitialized || !Clerk.client) {
        throw new Error('System not initialized. Please wait...');
      }

      // Show loading state
      statusContainer.innerHTML = `
        <div class="text-blue-500">
          <strong>Status:</strong> Processing sign in...
        </div>
      `;

      // Create SignIn instance with the provided email
      signIn = await Clerk.client.signIn.create({
        identifier: emailInput.value,
        strategy: 'email_code',
      });

      if (!signIn) {
        throw new Error('Failed to create SignIn instance');
      }

      // Initial update using getters
      updateStatus();

      await signIn.prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId: emailInput.value,
      });

      await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code: passwordInput.value,
      });

      // Update status after sign-in attempt
      updateStatus();
    } catch (error) {
      console.error('Sign in error:', error);
      statusContainer.innerHTML = `
        <div class="text-red-500">
          <strong>Error:</strong> ${error instanceof Error ? error.message : 'An error occurred'}
        </div>
      `;
    }
  });

  // Initialize on mount
  void initializeSignIn();
}

void (async () => {
  assertClerkIsLoaded(Clerk);
  fillLocalizationSelect();
  const { updateVariables } = appearanceVariableOptions();
  const { updateOtherOptions } = otherOptions();

  const sidebars = document.querySelectorAll('[data-sidebar]');
  document.addEventListener('keydown', e => {
    if (e.key === '/') {
      sidebars.forEach(s => s.classList.toggle('hidden'));
    }
  });

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
    '/keyless': () => {
      void Clerk.__unstable__updateProps({
        options: {
          __internal_keyless_claimKeylessApplicationUrl: 'https://dashboard.clerk.com',
          __internal_keyless_copyInstanceKeysUrl: 'https://dashboard.clerk.com',
        },
      });
    },
    '/pricing-table': () => {
      Clerk.mountPricingTable(app, componentControls.pricingTable.getProps() ?? {});
    },
    '/oauth-consent': () => {
      const searchParams = new URLSearchParams(window.location.search);
      const scopes = (searchParams.get('scopes')?.split(',') ?? []).map(scope => ({
        scope,
        description: `Grants access to your ${scope}`,
      }));
      Clerk.__internal_mountOAuthConsent(
        app,
        componentControls.oauthConsent.getProps() ?? {
          scopes,
          oAuthApplicationName: searchParams.get('oauth-application-name'),
          redirectUrl: searchParams.get('redirect_uri'),
        },
      );
    },
    '/open-sign-in': () => {
      mountOpenSignInButton(app, componentControls.signIn.getProps() ?? {});
    },
    '/open-sign-up': () => {
      mountOpenSignUpButton(app, componentControls.signUp.getProps() ?? {});
    },
    '/sign-in-observable': async () => {
      // Wait for Clerk to be fully loaded before mounting the component
      if (!Clerk.loaded) {
        await new Promise<void>(resolve => {
          const checkLoaded = () => {
            if (Clerk.loaded) {
              resolve();
            } else {
              setTimeout(checkLoaded, 100);
            }
          };
          checkLoaded();
        });
      }
      mountSignInObservable(app);
    },
  };

  const route = window.location.pathname as keyof typeof routes;
  if (route in routes) {
    const renderCurrentRoute = routes[route];
    addCurrentRouteIndicator(route);
    await Clerk.load({
      ...(componentControls.clerk.getProps() ?? {}),
      signInUrl: '/sign-in',
      signUpUrl: '/sign-up',
    });
    await renderCurrentRoute();
    updateVariables();
    updateOtherOptions();
  } else {
    console.error(`Unknown route: "${route}".`);
  }
})();
