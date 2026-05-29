import { PageMocking, type MockScenario } from '@clerk/msw';
import * as l from '../../localizations';
import { dark, neobrutalism, shadcn, shadesOfPurple } from '../../ui/src/themes';
import type { Clerk as ClerkType } from '../';
import { initCommandPalette } from './cmdk';
import * as scenarios from './scenarios';

interface ComponentPropsControl {
  setProps: (props: unknown) => void;
  getProps: () => any | null;
}

interface ScenarioControls {
  setScenario: (scenario: AvailableScenario | null) => void;
  availableScenarios: typeof AVAILABLE_SCENARIOS;
}

const COMPONENT_PROPS_NAMESPACE = 'clerk-js-sandbox';

const AVAILABLE_LOCALES = Object.keys(l) as (keyof typeof l)[];

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
  'configureSSO',
  'oauthConsent',
  'taskChooseOrganization',
  'taskResetPassword',
  'taskSetupMFA',
] as const;
type AvailableComponent = (typeof AVAILABLE_COMPONENTS)[number];

const AVAILABLE_SCENARIOS = Object.keys(scenarios) as (keyof typeof scenarios)[];
type AvailableScenario = (typeof AVAILABLE_SCENARIOS)[number];

const COLOR_DEFAULTS: Record<string, string> = {
  colorPrimary: '#2F3037',
  colorNeutral: '#000000',
  colorBackground: '#ffffff',
  colorPrimaryForeground: '#ffffff',
  colorDanger: '#EF4444',
  colorSuccess: '#22C543',
  colorWarning: '#F36B16',
  colorForeground: '#212126',
  colorMutedForeground: '#747686',
  colorInputForeground: '#000000',
  colorInput: '#ffffff',
  colorShimmer: '#ffffff',
};

const VARIABLE_DEFAULTS: Record<string, string> = {
  ...COLOR_DEFAULTS,
  spacing: '1rem',
  borderRadius: '0.375rem',
};

const OTHER_DEFAULTS = {
  localization: 'enUS',
  elevation: 'raised' as const,
  devWarnings: true,
};

function getScenario(): (() => MockScenario) | null {
  const scenarioName = localStorage.getItem(`${COMPONENT_PROPS_NAMESPACE}-scenario`);
  if (scenarioName && AVAILABLE_SCENARIOS.includes(scenarioName as AvailableScenario)) {
    return scenarios[scenarioName as AvailableScenario];
  }
  return null;
}

function setScenario(scenario: AvailableScenario | null) {
  if (!scenario) {
    localStorage.removeItem(`${COMPONENT_PROPS_NAMESPACE}-scenario`);
    const url = new URL(window.location.href);
    url.searchParams.delete('scenario');
    window.location.href = url.toString();
    return;
  }

  if (!AVAILABLE_SCENARIOS.includes(scenario)) {
    throw new Error(`Invalid scenario: "${scenario}". Available scenarios: ${AVAILABLE_SCENARIOS.join(', ')}`);
  }
  localStorage.setItem(`${COMPONENT_PROPS_NAMESPACE}-scenario`, scenario);

  const url = new URL(window.location.href);
  url.searchParams.set('scenario', scenario);
  window.location.href = url.toString();
}

const scenarioControls: ScenarioControls = {
  setScenario,
  availableScenarios: AVAILABLE_SCENARIOS,
};

function setComponentProps(component: AvailableComponent, props: unknown) {
  const encodedProps = JSON.stringify(props);

  const url = new URL(window.location.href);
  url.searchParams.set(component, encodedProps);

  window.location.href = url.toString();
}

function getComponentProps(component: AvailableComponent): unknown | null {
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

function buildComponentControls(component: AvailableComponent): ComponentPropsControl {
  return {
    setProps(props) {
      setComponentProps(component, props);
    },
    getProps() {
      return getComponentProps(component);
    },
  };
}

const componentControls: Record<AvailableComponent, ComponentPropsControl> = {
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
  configureSSO: buildComponentControls('configureSSO'),
  oauthConsent: buildComponentControls('oauthConsent'),
  taskChooseOrganization: buildComponentControls('taskChooseOrganization'),
  taskResetPassword: buildComponentControls('taskResetPassword'),
  taskSetupMFA: buildComponentControls('taskSetupMFA'),
};

declare global {
  interface Window {
    components: Record<AvailableComponent, ComponentPropsControl>;
    scenario: typeof scenarioControls;
    AVAILABLE_SCENARIOS: Record<AvailableScenario, AvailableScenario>;
  }
}

window.components = componentControls;
window.scenario = scenarioControls;
window.AVAILABLE_SCENARIOS = AVAILABLE_SCENARIOS.reduce(
  (acc, scenario) => {
    acc[scenario] = scenario;
    return acc;
  },
  {} as Record<AvailableScenario, AvailableScenario>,
);

initCommandPalette();

const Clerk = window.Clerk;
function assertClerkIsLoaded(c: ClerkType | undefined): asserts c is ClerkType {
  if (!c) {
    throw new Error('Clerk is not loaded');
  }
}

function mountIndex(element: HTMLDivElement) {
  assertClerkIsLoaded(Clerk);
  const user = Clerk.user;
  element.innerHTML = `<pre class="text-left whitespace-pre overflow-x-auto text-muted-foreground p-4 border border-[var(--color-sidebar-border)] rounded-md text-sm"><code>${JSON.stringify({ user }, null, 2)}</code></pre>`;
}

function mountOpenButton(element: HTMLDivElement, label: string, openFn: (props: any) => void, props: any) {
  const button = document.createElement('button');
  button.textContent = label;
  button.onclick = () => openFn(props);
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

async function initControls() {
  assertClerkIsLoaded(Clerk);

  const { Pane } = (await import(
    /* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.js'
  )) as any;

  const PARAMS: Record<string, any> = {};
  for (const [key, def] of Object.entries(VARIABLE_DEFAULTS)) {
    PARAMS[key] = sessionStorage.getItem(key) ?? def;
  }
  PARAMS.baseTheme = sessionStorage.getItem('baseTheme') ?? '';
  PARAMS.darkMode = document.documentElement.classList.contains('dark');
  PARAMS.localization = sessionStorage.getItem('localization') ?? OTHER_DEFAULTS.localization;
  PARAMS.elevation = sessionStorage.getItem('elevation') ?? OTHER_DEFAULTS.elevation;
  PARAMS.devWarnings = sessionStorage.getItem('devWarnings') !== 'off';

  const pane = new Pane({ title: 'Controls', expanded: false });

  const applyVariables = () => {
    const vars: Record<string, string> = {};
    for (const key of Object.keys(VARIABLE_DEFAULTS)) {
      sessionStorage.setItem(key, PARAMS[key]);
      vars[key] = PARAMS[key];
    }
    void Clerk.__internal_updateProps({
      appearance: {
        ...Clerk.__internal_getOption('appearance'),
        variables: vars,
      },
    });
  };

  const applyTheme = () => {
    sessionStorage.setItem('baseTheme', PARAMS.baseTheme);
    const currentAppearance = Clerk.__internal_getOption('appearance') ?? {};
    void Clerk.__internal_updateProps({
      appearance: {
        ...currentAppearance,
        theme: PARAMS.baseTheme ? themes[PARAMS.baseTheme] : undefined,
      },
    });
  };

  const applyLocalization = () => {
    sessionStorage.setItem('localization', PARAMS.localization);
    void Clerk.__internal_updateProps({
      options: { localization: l[PARAMS.localization as keyof typeof l] },
    });
  };

  const applyAppearanceOptions = () => {
    sessionStorage.setItem('elevation', PARAMS.elevation);
    sessionStorage.setItem('devWarnings', PARAMS.devWarnings ? 'on' : 'off');
    const currentAppearance = Clerk.__internal_getOption('appearance') ?? {};
    void Clerk.__internal_updateProps({
      appearance: {
        ...currentAppearance,
        options: {
          ...(currentAppearance as any).options,
          elevation: PARAMS.elevation as 'raised' | 'flush',
          unsafe_disableDevelopmentModeWarnings: !PARAMS.devWarnings,
        },
      },
    });
  };

  // Theme folder
  const themeFolder = pane.addFolder({ title: 'Theme', expanded: false });
  themeFolder
    .addBinding(PARAMS, 'baseTheme', {
      options: {
        default: '',
        dark: 'dark',
        shadesOfPurple: 'shadesOfPurple',
        neobrutalism: 'neobrutalism',
        shadcn: 'shadcn',
      },
    })
    .on('change', applyTheme);
  themeFolder.addButton({ title: 'Reset' }).on('click', () => {
    PARAMS.baseTheme = '';
    sessionStorage.removeItem('baseTheme');
    pane.refresh();
    applyTheme();
  });

  // Variables folder
  const varFolder = pane.addFolder({ title: 'Variables' });
  for (const key of Object.keys(COLOR_DEFAULTS)) {
    varFolder.addBinding(PARAMS, key).on('change', applyVariables);
  }
  varFolder.addBinding(PARAMS, 'spacing').on('change', applyVariables);
  varFolder.addBinding(PARAMS, 'borderRadius').on('change', applyVariables);
  varFolder.addButton({ title: 'Reset' }).on('click', () => {
    Object.assign(PARAMS, VARIABLE_DEFAULTS);
    for (const key of Object.keys(VARIABLE_DEFAULTS)) {
      sessionStorage.removeItem(key);
    }
    pane.refresh();
    const currentAppearance = Clerk.__internal_getOption('appearance') ?? {};
    void Clerk.__internal_updateProps({
      appearance: {
        ...currentAppearance,
        variables: undefined,
      },
    });
  });

  // Options folder
  const otherFolder = pane.addFolder({ title: 'Options', expanded: false });
  const localeOptions: Record<string, string> = {};
  for (const locale of AVAILABLE_LOCALES) {
    localeOptions[locale] = locale;
  }
  otherFolder.addBinding(PARAMS, 'localization', { options: localeOptions }).on('change', applyLocalization);
  otherFolder
    .addBinding(PARAMS, 'elevation', { options: { raised: 'raised' as const, flush: 'flush' as const } })
    .on('change', applyAppearanceOptions);
  otherFolder.addBinding(PARAMS, 'devWarnings').on('change', applyAppearanceOptions);
  otherFolder.addButton({ title: 'Reset' }).on('click', () => {
    PARAMS.localization = OTHER_DEFAULTS.localization;
    PARAMS.elevation = OTHER_DEFAULTS.elevation;
    PARAMS.devWarnings = OTHER_DEFAULTS.devWarnings;
    sessionStorage.removeItem('localization');
    sessionStorage.removeItem('elevation');
    sessionStorage.removeItem('devWarnings');
    pane.refresh();
    applyLocalization();
    applyAppearanceOptions();
  });

  // Page folder
  const pageFolder = pane.addFolder({ title: 'Page', expanded: false });
  pageFolder.addBinding(PARAMS, 'darkMode', { label: 'Dark mode' }).on('change', (ev: any) => {
    document.documentElement.classList.toggle('dark', ev.value);
    localStorage.setItem('clerk-js-sandbox-dark-mode', ev.value ? 'on' : 'off');
  });
  pageFolder.addButton({ title: 'Reset' }).on('click', () => {
    PARAMS.darkMode = false;
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('clerk-js-sandbox-dark-mode');
    pane.refresh();
  });

  return { pane, applyVariables, applyTheme, applyLocalization, applyAppearanceOptions };
}

const themes: Record<string, unknown> = {
  dark,
  shadesOfPurple,
  neobrutalism,
  shadcn,
};

const urlParams = new URL(window.location.href).searchParams;
for (const [component, encodedProps] of urlParams.entries()) {
  if (AVAILABLE_COMPONENTS.includes(component as AvailableComponent)) {
    localStorage.setItem(`${COMPONENT_PROPS_NAMESPACE}-${component}`, encodedProps);
  }

  if (component === 'scenario' && AVAILABLE_SCENARIOS.includes(encodedProps as AvailableScenario)) {
    localStorage.setItem(`${COMPONENT_PROPS_NAMESPACE}-scenario`, encodedProps);
  }
}

void (async () => {
  assertClerkIsLoaded(Clerk);

  const app = document.getElementById('app') as HTMLDivElement;

  const mountableRoutes: Record<
    string,
    { mount: string; component: AvailableComponent; defaultProps?: Record<string, unknown> }
  > = {
    '/sign-in': { mount: 'mountSignIn', component: 'signIn' },
    '/sign-up': { mount: 'mountSignUp', component: 'signUp' },
    '/user-avatar': { mount: 'mountUserAvatar', component: 'userAvatar' },
    '/user-button': { mount: 'mountUserButton', component: 'userButton' },
    '/user-profile': { mount: 'mountUserProfile', component: 'userProfile' },
    '/create-organization': { mount: 'mountCreateOrganization', component: 'createOrganization' },
    '/organization-list': { mount: 'mountOrganizationList', component: 'organizationList' },
    '/organization-profile': { mount: 'mountOrganizationProfile', component: 'organizationProfile' },
    '/organization-switcher': { mount: 'mountOrganizationSwitcher', component: 'organizationSwitcher' },
    '/waitlist': { mount: 'mountWaitlist', component: 'waitlist' },
    '/pricing-table': { mount: 'mountPricingTable', component: 'pricingTable' },
    '/api-keys': { mount: 'mountAPIKeys', component: 'apiKeys' },
    '/configure-sso': { mount: 'mountConfigureSSO', component: 'configureSSO' },
    '/task-choose-organization': {
      mount: 'mountTaskChooseOrganization',
      component: 'taskChooseOrganization',
      defaultProps: { redirectUrlComplete: '/user-profile' },
    },
    '/task-reset-password': {
      mount: 'mountTaskResetPassword',
      component: 'taskResetPassword',
      defaultProps: { redirectUrlComplete: '/user-profile' },
    },
    '/task-setup-mfa': {
      mount: 'mountTaskSetupMFA',
      component: 'taskSetupMFA',
      defaultProps: { redirectUrlComplete: '/user-profile' },
    },
  };

  const routes: Record<string, () => void> = {
    '/': () => mountIndex(app),
    '/keyless': () => {
      void Clerk.__internal_updateProps({
        options: {
          __internal_keyless_claimKeylessApplicationUrl: 'https://dashboard.clerk.com',
          __internal_keyless_copyInstanceKeysUrl: 'https://dashboard.clerk.com',
        },
      });
    },
    '/oauth-consent': () => {
      const searchParams = new URLSearchParams(window.location.search);
      const scopes = (searchParams.get('scope')?.split(',') ?? []).map(scope => ({
        scope,
        description: scope === 'offline_access' ? null : `Grants access to your ${scope}`,
        requires_consent: true,
      }));
      Clerk.mountOAuthConsent(
        app,
        componentControls.oauthConsent.getProps() ?? {
          scopes,
          oauthClientId: 'Wg9fP2d0pSFXCZ1u',
          redirectUrl: searchParams.get('redirect_uri') ?? 'http://localhost:4000/oauth/callback',
        },
      );
    },
    '/open-sign-in': () =>
      mountOpenButton(app, 'Open Sign In', p => Clerk?.openSignIn(p), componentControls.signIn.getProps() ?? {}),
    '/open-sign-up': () =>
      mountOpenButton(app, 'Open Sign Up', p => Clerk?.openSignUp(p), componentControls.signUp.getProps() ?? {}),
  };

  for (const [path, { mount, component, defaultProps }] of Object.entries(mountableRoutes)) {
    routes[path] = () => {
      (Clerk as any)[mount](app, componentControls[component].getProps() ?? defaultProps ?? {});
    };
  }

  const route = window.location.pathname as keyof typeof routes;
  if (route in routes) {
    const renderCurrentRoute = routes[route];
    addCurrentRouteIndicator(route);

    const scenario = getScenario();
    if (scenario) {
      const mocking = new PageMocking({
        onStateChange: state => {
          console.log('Mocking state changed:', state);
        },
      });
      await mocking.initialize(route, { scenario });
    }

    const initialThemeName = sessionStorage.getItem('baseTheme') ?? '';
    const initialTheme = initialThemeName ? themes[initialThemeName] : undefined;
    const initialElevation = sessionStorage.getItem('elevation') as 'raised' | 'flush' | null;
    const initialDevWarnings = sessionStorage.getItem('devWarnings');
    const initialAppearanceOptions: Record<string, unknown> = {};
    if (initialElevation) {
      initialAppearanceOptions.elevation = initialElevation;
    }
    if (initialDevWarnings === 'off') {
      initialAppearanceOptions.unsafe_disableDevelopmentModeWarnings = true;
    }

    const initialVariables: Record<string, string> = {};
    for (const key of Object.keys(VARIABLE_DEFAULTS)) {
      const stored = sessionStorage.getItem(key);
      if (stored !== null) {
        initialVariables[key] = stored;
      }
    }

    const initialLocale = sessionStorage.getItem('localization') ?? 'enUS';

    await Clerk.load({
      ...(componentControls.clerk.getProps() ?? {}),
      signInUrl: '/sign-in',
      signUpUrl: '/sign-up',
      ui: { ClerkUI: window.__internal_ClerkUICtor },
      appearance: {
        ...(initialTheme
          ? { theme: initialTheme }
          : Object.keys(initialVariables).length > 0
            ? { variables: initialVariables }
            : {}),
        ...(Object.keys(initialAppearanceOptions).length ? { options: initialAppearanceOptions } : {}),
      },
      localization: l[initialLocale as keyof typeof l],
    });
    renderCurrentRoute();
    const { pane } = await initControls();

    const leftSidebar = document.querySelector('[data-sidebar]') as HTMLElement;
    const sidebarToggle = document.getElementById('sidebarToggle');

    const toggleSidebar = () => {
      leftSidebar?.classList.toggle('max-lg:hidden');
    };

    sidebarToggle?.addEventListener('click', toggleSidebar);

    document.addEventListener('keydown', e => {
      if (e.key === '/') {
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          return;
        }
        leftSidebar?.classList.toggle('hidden');
        pane.hidden = !pane.hidden;
      }
    });
  } else {
    console.error(`Unknown route: "${route}".`);
  }
})();
