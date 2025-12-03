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
  'userAvatar',
  'userButton',
  'userProfile',
  'createOrganization',
  'organizationList',
  'organizationProfile',
  'organizationSwitcher',
  'waitlist',
  'pricingTable',
  'apiKeys',
  'oauthConsent',
  'taskChooseOrganization',
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
  userAvatar: buildComponentControls('userAvatar'),
  userButton: buildComponentControls('userButton'),
  userProfile: buildComponentControls('userProfile'),
  createOrganization: buildComponentControls('createOrganization'),
  organizationList: buildComponentControls('organizationList'),
  organizationProfile: buildComponentControls('organizationProfile'),
  organizationSwitcher: buildComponentControls('organizationSwitcher'),
  waitlist: buildComponentControls('waitlist'),
  pricingTable: buildComponentControls('pricingTable'),
  apiKeys: buildComponentControls('apiKeys'),
  oauthConsent: buildComponentControls('oauthConsent'),
  taskChooseOrganization: buildComponentControls('taskChooseOrganization'),
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
    'colorPrimaryForeground',
    'colorForeground',
    'colorDanger',
    'colorSuccess',
    'colorWarning',
    'colorForeground',
    'colorMutedForeground',
    'colorInputForeground',
    'colorInput',
    'colorShimmer',
    'spacing',
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
    void Clerk.__internal__updateProps({
      appearance: {
        // Preserve existing appearance properties like baseTheme
        ...Clerk.__internal_getOption('appearance'),
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
    void Clerk.__internal__updateProps({
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
    '/user-avatar': () => {
      Clerk.mountUserAvatar(app, componentControls.userAvatar.getProps() ?? {});
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
      void Clerk.__internal__updateProps({
        options: {
          __internal_keyless_claimKeylessApplicationUrl: 'https://dashboard.clerk.com',
          __internal_keyless_copyInstanceKeysUrl: 'https://dashboard.clerk.com',
        },
      });
    },
    '/pricing-table': () => {
      Clerk.mountPricingTable(app, componentControls.pricingTable.getProps() ?? {});
    },
    '/api-keys': () => {
      Clerk.mountAPIKeys(app, componentControls.apiKeys.getProps() ?? {});
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
          oAuthApplicationLogoUrl: searchParams.get('logo-url'),
          oAuthApplicationUrl: searchParams.get('app-url'),
        },
      );
    },
    '/task-choose-organization': () => {
      Clerk.mountTaskChooseOrganization(
        app,
        componentControls.taskChooseOrganization.getProps() ?? {
          redirectUrlComplete: '/user-profile',
        },
      );
    },
    '/open-sign-in': () => {
      mountOpenSignInButton(app, componentControls.signIn.getProps() ?? {});
    },
    '/open-sign-up': () => {
      mountOpenSignUpButton(app, componentControls.signUp.getProps() ?? {});
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
    renderCurrentRoute();
    updateVariables();
    updateOtherOptions();
  } else {
    console.error(`Unknown route: "${route}".`);
  }
})();
